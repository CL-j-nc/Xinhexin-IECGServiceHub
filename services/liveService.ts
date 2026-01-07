import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { createPcmBlob, decode, decodeAudioData } from './audioUtils';
import { generateSystemInstruction } from './policyEngine';
import { queryPolicyDatabase } from './mockDatabase';

const lookupPolicyTool: FunctionDeclaration = {
  name: 'lookup_policy',
  description: 'Retrieve commercial fleet policy details by policy ID (e.g., POL-8888).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      policyId: {
        type: Type.STRING,
        description: 'The policy ID string.',
      },
    },
    required: ['policyId'],
  },
};

const LIVE_ROLE_CONTEXT = `
You are the Voice Assistant for "ChinaLife-JHPCIC".
IMPORTANT FOR VOICE: You are on a phone call. Keep responses concise (1-2 sentences). 
Be extremely natural, warm, but strictly adhere to the Business Scope and Policy Guardrails.
Do not use markdown formatting in speech.
`;

export class LiveVoiceClient {
  private ai: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private outputNode: AudioNode | null = null;
  private sources = new Set<AudioBufferSourceNode>();
  private nextStartTime = 0;
  private sessionPromise: Promise<any> | null = null;
  private stream: MediaStream | null = null;
  private isConnected = false;

  constructor() {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error("VITE_GEMINI_API_KEY is missing");
    }

    this.ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  }

  async connect(onStatusChange: (status: string) => void) {
    if (this.isConnected) return;
    
    onStatusChange('connecting');

    // 1. Setup Audio Contexts
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    this.outputNode = this.outputAudioContext.createGain();
    this.outputNode.connect(this.outputAudioContext.destination);

    // 2. Get Microphone Stream
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      console.error("Mic permission denied", e);
      onStatusChange('error');
      return;
    }

    // 3. Connect to Gemini Live
    // GENERATE INSTRUCTION FROM JSON POLICY
    const fullSystemInstruction = generateSystemInstruction(LIVE_ROLE_CONTEXT);

    this.sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          this.isConnected = true;
          onStatusChange('connected');
          this.startInputStreaming();
        },
        onmessage: async (message: LiveServerMessage) => {
          this.handleServerMessage(message);
        },
        onclose: () => {
          this.isConnected = false;
          onStatusChange('disconnected');
        },
        onerror: (e) => {
          console.error("Live API Error", e);
          this.isConnected = false;
          onStatusChange('error');
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        systemInstruction: fullSystemInstruction,
        tools: [{ functionDeclarations: [lookupPolicyTool] }],
      },
    });
  }

  private startInputStreaming() {
    if (!this.inputAudioContext || !this.stream || !this.sessionPromise) return;

    const source = this.inputAudioContext.createMediaStreamSource(this.stream);
    const scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
      if (!this.isConnected) return;
      
      const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
      const pcmBlob = createPcmBlob(inputData);
      
      this.sessionPromise?.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    source.connect(scriptProcessor);
    scriptProcessor.connect(this.inputAudioContext.destination);
  }

  private async handleServerMessage(message: LiveServerMessage) {
    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (base64Audio && this.outputAudioContext && this.outputNode) {
      this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
      
      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        this.outputAudioContext,
        24000,
        1
      );

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputNode);
      source.addEventListener('ended', () => {
        this.sources.delete(source);
      });
      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.sources.add(source);
    }

    if (message.serverContent?.interrupted) {
      this.sources.forEach(src => src.stop());
      this.sources.clear();
      this.nextStartTime = 0;
    }

    if (message.toolCall) {
        for (const fc of message.toolCall.functionCalls) {
            if (fc.name === 'lookup_policy') {
                const args = fc.args as any;
                const result = await queryPolicyDatabase(args.policyId);
                const responsePayload = {
                    result: result ? result : { error: "Policy not found" }
                };

                this.sessionPromise?.then(session => {
                    session.sendToolResponse({
                        functionResponses: {
                            id: fc.id,
                            name: fc.name,
                            response: responsePayload
                        }
                    });
                });
            }
        }
    }
  }

  disconnect() {
    this.isConnected = false;
    if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
    }
    this.inputAudioContext?.close();
    this.outputAudioContext?.close();
    this.sessionPromise = null;
  }
}
