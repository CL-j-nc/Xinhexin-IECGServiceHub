type AudioContextConstructor = typeof AudioContext | undefined;

let audioContext: AudioContext | null = null;

const getAudioContextConstructor = (): AudioContextConstructor => {
    if (typeof window === 'undefined') return undefined;
    const win = window as Window & { webkitAudioContext?: typeof AudioContext };
    return win.AudioContext || win.webkitAudioContext;
};

export const getAudioContext = (): AudioContext => {
    if (audioContext) return audioContext;
    const AudioCtx = getAudioContextConstructor();
    if (!AudioCtx) throw new Error('AudioContext is not supported in this environment.');
    audioContext = new AudioCtx();
    return audioContext;
};

export const resumeAudioContext = async (): Promise<AudioContextState> => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        await ctx.resume();
    }
    return ctx.state;
};

export const closeAudioContext = async (): Promise<void> => {
    if (!audioContext) return;
    await audioContext.close();
    audioContext = null;
};

export const decodeAudioData = async (buffer: ArrayBuffer): Promise<AudioBuffer> => {
    const ctx = getAudioContext();
    return ctx.decodeAudioData(buffer.slice(0));
};

export const loadAudioBufferFromUrl = async (url: string): Promise<AudioBuffer> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load audio: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    return decodeAudioData(buffer);
};

export const loadAudioBufferFromFile = async (file: File): Promise<AudioBuffer> => {
    const buffer = await file.arrayBuffer();
    return decodeAudioData(buffer);
};

export interface PlaybackOptions {
    loop?: boolean;
    volume?: number;
    onEnded?: () => void;
}

export interface PlaybackHandle {
    source: AudioBufferSourceNode;
    gainNode: GainNode;
    stop: () => void;
}

export const playAudioBuffer = (buffer: AudioBuffer, options: PlaybackOptions = {}): PlaybackHandle => {
    const ctx = getAudioContext();
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();

    source.buffer = buffer;
    source.loop = Boolean(options.loop);
    gainNode.gain.value = options.volume ?? 1;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (options.onEnded) {
        source.addEventListener('ended', options.onEnded, { once: true });
    }

    source.start();

    const stop = () => {
        try {
            source.stop();
        } catch (_) {
            // Ignore stop errors from already-ended sources.
        }
        source.disconnect();
        gainNode.disconnect();
    };

    return { source, gainNode, stop };
};

export interface MicrophoneOptions {
    echoCancellation?: boolean;
    noiseSuppression?: boolean;
    autoGainControl?: boolean;
    channelCount?: number;
}

export const captureMicrophone = async (options: MicrophoneOptions = {}): Promise<MediaStream> => {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia is not supported in this environment.');
    }

    return navigator.mediaDevices.getUserMedia({
        audio: {
            echoCancellation: options.echoCancellation ?? true,
            noiseSuppression: options.noiseSuppression ?? true,
            autoGainControl: options.autoGainControl ?? true,
            channelCount: options.channelCount ?? 1
        }
    });
};

export const stopMediaStream = (stream: MediaStream): void => {
    stream.getTracks().forEach(track => track.stop());
};

export interface RecorderOptions {
    mimeType?: string;
    bitsPerSecond?: number;
    timesliceMs?: number;
}

const pickSupportedMimeType = (preferred?: string): string | undefined => {
    if (typeof MediaRecorder === 'undefined') return undefined;
    if (preferred && MediaRecorder.isTypeSupported(preferred)) return preferred;

    const fallbacks = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg'];
    return fallbacks.find(type => MediaRecorder.isTypeSupported(type));
};

export const createMediaRecorder = (stream: MediaStream, options: RecorderOptions = {}): MediaRecorder => {
    if (typeof MediaRecorder === 'undefined') {
        throw new Error('MediaRecorder is not supported in this environment.');
    }

    const mimeType = pickSupportedMimeType(options.mimeType);
    return new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: options.bitsPerSecond
    });
};

export interface RecordHandle {
    recorder: MediaRecorder;
    stop: () => Promise<Blob>;
}

export const recordAudio = (stream: MediaStream, options: RecorderOptions = {}): RecordHandle => {
    const recorder = createMediaRecorder(stream, options);
    const chunks: BlobPart[] = [];

    recorder.addEventListener('dataavailable', event => {
        if (event.data && event.data.size > 0) {
            chunks.push(event.data);
        }
    });

    const stopped = new Promise<Blob>(resolve => {
        recorder.addEventListener('stop', () => {
            resolve(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
        });
    });

    recorder.start(options.timesliceMs);

    const stop = async () => {
        if (recorder.state !== 'inactive') {
            recorder.stop();
        }
        return stopped;
    };

    return { recorder, stop };
};

export const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });

export const formatDuration = (seconds: number): string => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
};
