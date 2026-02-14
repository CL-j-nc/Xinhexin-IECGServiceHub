import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// MediaPipe Face Mesh types
declare global {
    interface Window {
        FaceMesh: any;
        Camera: any;
        drawConnectors: any;
        drawLandmarks: any;
        FACEMESH_TESSELATION: any;
        FACEMESH_RIGHT_EYE: any;
        FACEMESH_LEFT_EYE: any;
        FACEMESH_FACE_OVAL: any;
        FACEMESH_LIPS: any;
    }
}

interface FaceLandmarks {
    headRotation: { x: number; y: number; z: number };
    leftEyeOpen: number;
    rightEyeOpen: number;
    mouthOpen: number;
    mouthWidth: number;
    eyebrowRaise: number;
}

const VideoAvatarPoC: React.FC = () => {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const avatarCanvasRef = useRef<HTMLCanvasElement>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [avatarStyle, setAvatarStyle] = useState<'cartoon' | 'minimal' | 'professional'>('cartoon');
    const [showOriginal, setShowOriginal] = useState(true);
    const [landmarks, setLandmarks] = useState<FaceLandmarks | null>(null);

    const faceMeshRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);

    // 加载 MediaPipe 脚本
    const loadMediaPipeScripts = useCallback(async () => {
        const scripts = [
            'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
            'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
            'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'
        ];

        for (const src of scripts) {
            if (!document.querySelector(`script[src="${src}"]`)) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.crossOrigin = 'anonymous';
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error(`Failed to load ${src}`));
                    document.head.appendChild(script);
                });
            }
        }
    }, []);

    // 从关键点计算面部特征
    const extractFaceFeatures = (landmarks: any[]): FaceLandmarks => {
        // 眼睛开合度 (使用上下眼睑距离)
        const leftEyeTop = landmarks[159];
        const leftEyeBottom = landmarks[145];
        const leftEyeOpen = Math.abs(leftEyeTop.y - leftEyeBottom.y) * 10;

        const rightEyeTop = landmarks[386];
        const rightEyeBottom = landmarks[374];
        const rightEyeOpen = Math.abs(rightEyeTop.y - rightEyeBottom.y) * 10;

        // 嘴巴开合度
        const upperLip = landmarks[13];
        const lowerLip = landmarks[14];
        const mouthOpen = Math.abs(upperLip.y - lowerLip.y) * 15;

        // 嘴巴宽度
        const leftMouth = landmarks[61];
        const rightMouth = landmarks[291];
        const mouthWidth = Math.abs(leftMouth.x - rightMouth.x) * 5;

        // 眉毛高度
        const leftEyebrow = landmarks[66];
        const leftEye = landmarks[159];
        const eyebrowRaise = (leftEye.y - leftEyebrow.y) * 10;

        // 头部旋转 (简化计算)
        const nose = landmarks[1];
        const leftCheek = landmarks[234];
        const rightCheek = landmarks[454];

        const headRotation = {
            x: (nose.y - 0.5) * 60,  // 上下点头
            y: (nose.x - 0.5) * -60, // 左右转头
            z: (leftCheek.y - rightCheek.y) * 30 // 歪头
        };

        return {
            headRotation,
            leftEyeOpen: Math.min(Math.max(leftEyeOpen, 0), 1),
            rightEyeOpen: Math.min(Math.max(rightEyeOpen, 0), 1),
            mouthOpen: Math.min(Math.max(mouthOpen, 0), 1),
            mouthWidth: Math.min(Math.max(mouthWidth, 0.3), 1),
            eyebrowRaise: Math.min(Math.max(eyebrowRaise, 0), 1)
        };
    };

    // 绘制卡通风格数字人
    const drawCartoonAvatar = (ctx: CanvasRenderingContext2D, features: FaceLandmarks) => {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // 清空画布
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, width, height);

        // 应用头部旋转
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(features.headRotation.z * Math.PI / 180);
        ctx.translate(features.headRotation.y * 1.5, features.headRotation.x * 1.5);

        // 脸部 (椭圆)
        ctx.beginPath();
        ctx.ellipse(0, 0, 100, 130, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#fcd9b6';
        ctx.fill();
        ctx.strokeStyle = '#e8b88a';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 头发
        ctx.beginPath();
        ctx.ellipse(0, -80, 110, 70, 0, Math.PI, Math.PI * 2);
        ctx.fillStyle = '#2d1b0e';
        ctx.fill();

        // 左眼
        const leftEyeX = -35;
        const leftEyeY = -20;
        ctx.beginPath();
        ctx.ellipse(leftEyeX, leftEyeY, 20, 12 * features.leftEyeOpen + 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        // 瞳孔
        if (features.leftEyeOpen > 0.2) {
            ctx.beginPath();
            ctx.arc(leftEyeX + features.headRotation.y * 0.2, leftEyeY, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#1e3a5f';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(leftEyeX + features.headRotation.y * 0.2 - 2, leftEyeY - 2, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
        }

        // 右眼
        const rightEyeX = 35;
        const rightEyeY = -20;
        ctx.beginPath();
        ctx.ellipse(rightEyeX, rightEyeY, 20, 12 * features.rightEyeOpen + 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        // 瞳孔
        if (features.rightEyeOpen > 0.2) {
            ctx.beginPath();
            ctx.arc(rightEyeX + features.headRotation.y * 0.2, rightEyeY, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#1e3a5f';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(rightEyeX + features.headRotation.y * 0.2 - 2, rightEyeY - 2, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
        }

        // 眉毛
        const eyebrowY = -45 - features.eyebrowRaise * 10;
        ctx.beginPath();
        ctx.moveTo(leftEyeX - 20, eyebrowY);
        ctx.quadraticCurveTo(leftEyeX, eyebrowY - 5, leftEyeX + 20, eyebrowY);
        ctx.strokeStyle = '#2d1b0e';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rightEyeX - 20, eyebrowY);
        ctx.quadraticCurveTo(rightEyeX, eyebrowY - 5, rightEyeX + 20, eyebrowY);
        ctx.stroke();

        // 鼻子
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-8, 25);
        ctx.lineTo(0, 30);
        ctx.lineTo(8, 25);
        ctx.closePath();
        ctx.fillStyle = '#e8b88a';
        ctx.fill();

        // 嘴巴
        const mouthY = 60;
        const mouthW = 30 * features.mouthWidth;
        const mouthH = 5 + features.mouthOpen * 25;

        ctx.beginPath();
        if (features.mouthOpen > 0.2) {
            // 张嘴
            ctx.ellipse(0, mouthY, mouthW, mouthH, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#8b0000';
            ctx.fill();
            // 牙齿
            ctx.beginPath();
            ctx.rect(-mouthW + 5, mouthY - mouthH + 2, mouthW * 2 - 10, 8);
            ctx.fillStyle = 'white';
            ctx.fill();
        } else {
            // 闭嘴微笑
            ctx.moveTo(-mouthW, mouthY);
            ctx.quadraticCurveTo(0, mouthY + 15, mouthW, mouthY);
            ctx.strokeStyle = '#c44';
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        // 腮红
        ctx.beginPath();
        ctx.ellipse(-60, 30, 15, 10, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 150, 150, 0.4)';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(60, 30, 15, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // 标签
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('数字人形象', 10, height - 10);
    };

    // 绘制简约风格
    const drawMinimalAvatar = (ctx: CanvasRenderingContext2D, features: FaceLandmarks) => {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(features.headRotation.z * Math.PI / 180);
        ctx.translate(features.headRotation.y * 2, features.headRotation.x * 2);

        // 头部轮廓
        ctx.beginPath();
        ctx.arc(0, 0, 100, 0, Math.PI * 2);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 眼睛
        const eyeY = -20;
        ctx.beginPath();
        ctx.arc(-35, eyeY, 5 + features.leftEyeOpen * 10, 0, Math.PI * 2);
        ctx.arc(35, eyeY, 5 + features.rightEyeOpen * 10, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();

        // 嘴巴
        ctx.beginPath();
        ctx.moveTo(-30, 50);
        ctx.quadraticCurveTo(0, 50 + features.mouthOpen * 30, 30, 50);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('简约风格', 10, height - 10);
    };

    // 绘制专业风格
    const drawProfessionalAvatar = (ctx: CanvasRenderingContext2D, features: FaceLandmarks) => {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // 渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#1e3a5f');
        gradient.addColorStop(1, '#0f172a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(features.headRotation.z * Math.PI / 180);
        ctx.translate(features.headRotation.y * 1.5, features.headRotation.x * 1.5);

        // 头部 (更写实的形状)
        ctx.beginPath();
        ctx.ellipse(0, 10, 90, 115, 0, 0, Math.PI * 2);
        const skinGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 120);
        skinGradient.addColorStop(0, '#ffe4c9');
        skinGradient.addColorStop(1, '#ddb896');
        ctx.fillStyle = skinGradient;
        ctx.fill();

        // 头发
        ctx.beginPath();
        ctx.ellipse(0, -60, 95, 60, 0, Math.PI, 0);
        ctx.fillStyle = '#1a1a2e';
        ctx.fill();

        // 西装领
        ctx.beginPath();
        ctx.moveTo(-70, 130);
        ctx.lineTo(-30, 100);
        ctx.lineTo(0, 130);
        ctx.lineTo(30, 100);
        ctx.lineTo(70, 130);
        ctx.lineTo(70, 180);
        ctx.lineTo(-70, 180);
        ctx.closePath();
        ctx.fillStyle = '#1e3a5f';
        ctx.fill();

        // 衬衫
        ctx.beginPath();
        ctx.moveTo(-20, 105);
        ctx.lineTo(0, 130);
        ctx.lineTo(20, 105);
        ctx.lineTo(20, 180);
        ctx.lineTo(-20, 180);
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fill();

        // 领带
        ctx.beginPath();
        ctx.moveTo(-8, 115);
        ctx.lineTo(0, 125);
        ctx.lineTo(8, 115);
        ctx.lineTo(5, 180);
        ctx.lineTo(-5, 180);
        ctx.closePath();
        ctx.fillStyle = '#dc2626';
        ctx.fill();

        // 眼睛
        const drawEye = (x: number, openness: number) => {
            ctx.beginPath();
            ctx.ellipse(x, -15, 18, 10 * openness + 3, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            if (openness > 0.2) {
                ctx.beginPath();
                ctx.arc(x, -15, 7, 0, Math.PI * 2);
                ctx.fillStyle = '#2d1b0e';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x - 2, -17, 2, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();
            }
        };
        drawEye(-30, features.leftEyeOpen);
        drawEye(30, features.rightEyeOpen);

        // 眉毛
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-50, -35 - features.eyebrowRaise * 5);
        ctx.quadraticCurveTo(-30, -40 - features.eyebrowRaise * 5, -10, -35 - features.eyebrowRaise * 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(50, -35 - features.eyebrowRaise * 5);
        ctx.quadraticCurveTo(30, -40 - features.eyebrowRaise * 5, 10, -35 - features.eyebrowRaise * 5);
        ctx.stroke();

        // 鼻子
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.quadraticCurveTo(10, 20, 0, 25);
        ctx.strokeStyle = '#c9a282';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 嘴巴
        const mouthY = 55;
        if (features.mouthOpen > 0.15) {
            ctx.beginPath();
            ctx.ellipse(0, mouthY, 25 * features.mouthWidth, 8 + features.mouthOpen * 15, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#8b0000';
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(-25, mouthY);
            ctx.quadraticCurveTo(0, mouthY + 10, 25, mouthY);
            ctx.strokeStyle = '#a65a5a';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        ctx.restore();

        // 标签
        ctx.fillStyle = '#60a5fa';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('专业形象', 10, height - 10);
    };

    // 处理面部检测结果
    const onResults = useCallback((results: any) => {
        if (!canvasRef.current || !avatarCanvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        const avatarCtx = avatarCanvasRef.current.getContext('2d');
        if (!ctx || !avatarCtx) return;

        // 绘制原始视频
        ctx.save();
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const faceLandmarks = results.multiFaceLandmarks[0];

            // 绘制面部网格 (调试用)
            if (window.drawConnectors && window.FACEMESH_TESSELATION) {
                window.drawConnectors(ctx, faceLandmarks, window.FACEMESH_TESSELATION,
                    { color: '#10b98133', lineWidth: 1 });
                window.drawConnectors(ctx, faceLandmarks, window.FACEMESH_FACE_OVAL,
                    { color: '#10b981', lineWidth: 2 });
            }

            // 提取特征并绘制数字人
            const features = extractFaceFeatures(faceLandmarks);
            setLandmarks(features);

            // 根据风格绘制
            switch (avatarStyle) {
                case 'cartoon':
                    drawCartoonAvatar(avatarCtx, features);
                    break;
                case 'minimal':
                    drawMinimalAvatar(avatarCtx, features);
                    break;
                case 'professional':
                    drawProfessionalAvatar(avatarCtx, features);
                    break;
            }
        }

        ctx.restore();
    }, [avatarStyle]);

    // 初始化
    useEffect(() => {
        const init = async () => {
            try {
                setIsLoading(true);
                await loadMediaPipeScripts();

                // 等待脚本完全加载
                await new Promise(resolve => setTimeout(resolve, 500));

                if (!window.FaceMesh) {
                    throw new Error('MediaPipe FaceMesh 加载失败');
                }

                const faceMesh = new window.FaceMesh({
                    locateFile: (file: string) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                    }
                });

                faceMesh.setOptions({
                    maxNumFaces: 1,
                    refineLandmarks: true,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });

                faceMesh.onResults(onResults);
                faceMeshRef.current = faceMesh;

                setIsLoading(false);
            } catch (err: any) {
                setError(err.message || '初始化失败');
                setIsLoading(false);
            }
        };

        init();

        return () => {
            if (cameraRef.current) {
                cameraRef.current.stop();
            }
        };
    }, [loadMediaPipeScripts, onResults]);

    // 启动摄像头
    const startCamera = async () => {
        if (!videoRef.current || !faceMeshRef.current) return;

        try {
            const camera = new window.Camera(videoRef.current, {
                onFrame: async () => {
                    if (faceMeshRef.current && videoRef.current) {
                        await faceMeshRef.current.send({ image: videoRef.current });
                    }
                },
                width: 640,
                height: 480
            });

            await camera.start();
            cameraRef.current = camera;
            setIsRunning(true);
        } catch (err: any) {
            setError('无法访问摄像头: ' + err.message);
        }
    };

    // 停止摄像头
    const stopCamera = () => {
        if (cameraRef.current) {
            cameraRef.current.stop();
            cameraRef.current = null;
        }
        setIsRunning(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
            {/* Header */}
            <div className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/staff-dashboard')}
                        className="text-slate-400 hover:text-white transition"
                    >
                        ← 返回
                    </button>
                    <h1 className="font-bold text-sm tracking-wider">
                        数字人视频核验 <span className="text-slate-600">|</span> AVATAR PoC
                    </h1>
                </div>
                <span className="text-xs bg-amber-600/20 text-amber-400 px-2 py-1 rounded">
                    概念验证
                </span>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* 控制面板 */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={isRunning ? stopCamera : startCamera}
                            disabled={isLoading}
                            className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                                isRunning
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            } disabled:bg-slate-600 disabled:cursor-not-allowed`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    加载中...
                                </>
                            ) : isRunning ? (
                                '停止摄像头'
                            ) : (
                                '启动摄像头'
                            )}
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">形象风格:</span>
                            {(['cartoon', 'minimal', 'professional'] as const).map((style) => (
                                <button
                                    key={style}
                                    onClick={() => setAvatarStyle(style)}
                                    className={`px-3 py-1.5 rounded text-sm transition ${
                                        avatarStyle === style
                                            ? 'bg-cyan-600 text-white'
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                                >
                                    {style === 'cartoon' ? '卡通' : style === 'minimal' ? '简约' : '专业'}
                                </button>
                            ))}
                        </div>

                        <label className="flex items-center gap-2 text-sm text-slate-400">
                            <input
                                type="checkbox"
                                checked={showOriginal}
                                onChange={(e) => setShowOriginal(e.target.checked)}
                                className="rounded"
                            />
                            显示原始画面
                        </label>
                    </div>

                    {error && (
                        <div className="mt-4 text-red-400 text-sm bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-2">
                            {error}
                        </div>
                    )}
                </div>

                {/* 视频区域 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 原始画面 */}
                    {showOriginal && (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                            <div className="px-4 py-2 border-b border-slate-700 text-sm text-slate-400">
                                原始画面 (仅调试用)
                            </div>
                            <div className="relative aspect-[4/3] bg-slate-900">
                                <video
                                    ref={videoRef}
                                    className="absolute inset-0 w-full h-full object-cover opacity-0"
                                    playsInline
                                />
                                <canvas
                                    ref={canvasRef}
                                    width={640}
                                    height={480}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                {!isRunning && (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                                        点击"启动摄像头"开始
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 数字人画面 */}
                    <div className={`bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden ${!showOriginal ? 'md:col-span-2' : ''}`}>
                        <div className="px-4 py-2 border-b border-slate-700 text-sm text-emerald-400 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            数字人输出 (客户端显示)
                        </div>
                        <div className="relative aspect-[4/3] bg-slate-900">
                            <canvas
                                ref={avatarCanvasRef}
                                width={640}
                                height={480}
                                className={`absolute inset-0 w-full h-full object-cover ${!showOriginal ? 'max-w-2xl mx-auto' : ''}`}
                            />
                            {!isRunning && (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                                    等待摄像头启动...
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 实时参数 */}
                {landmarks && isRunning && (
                    <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                        <h3 className="text-sm font-medium text-slate-300 mb-3">实时面部参数</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-slate-500">头部旋转 X:</span>
                                <span className="ml-2 text-cyan-400">{landmarks.headRotation.x.toFixed(1)}°</span>
                            </div>
                            <div>
                                <span className="text-slate-500">头部旋转 Y:</span>
                                <span className="ml-2 text-cyan-400">{landmarks.headRotation.y.toFixed(1)}°</span>
                            </div>
                            <div>
                                <span className="text-slate-500">左眼开合:</span>
                                <span className="ml-2 text-cyan-400">{(landmarks.leftEyeOpen * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                                <span className="text-slate-500">右眼开合:</span>
                                <span className="ml-2 text-cyan-400">{(landmarks.rightEyeOpen * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                                <span className="text-slate-500">嘴巴开合:</span>
                                <span className="ml-2 text-cyan-400">{(landmarks.mouthOpen * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                                <span className="text-slate-500">嘴巴宽度:</span>
                                <span className="ml-2 text-cyan-400">{(landmarks.mouthWidth * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                                <span className="text-slate-500">眉毛高度:</span>
                                <span className="ml-2 text-cyan-400">{(landmarks.eyebrowRaise * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                                <span className="text-slate-500">歪头角度:</span>
                                <span className="ml-2 text-cyan-400">{landmarks.headRotation.z.toFixed(1)}°</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 说明 */}
                <div className="mt-6 bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 text-sm text-blue-300">
                    <h4 className="font-medium mb-2">PoC 说明</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-300/80">
                        <li>本页面演示浏览器端实时面部捕捉 + 数字人渲染</li>
                        <li>使用 MediaPipe Face Mesh 检测 468 个面部关键点</li>
                        <li>数字人表情实时跟随真人面部动作（眨眼、张嘴、转头等）</li>
                        <li>三种风格可选：卡通、简约、专业</li>
                        <li>下一步：集成 WebRTC 实现双向视频通话</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default VideoAvatarPoC;
