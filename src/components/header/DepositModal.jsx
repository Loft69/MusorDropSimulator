import React, { useEffect, useRef, useState } from 'react';
import Toast from "../common/Toast.jsx";
import "../../styles/depositModal.css";

const AD_REWARD = 1000;
const AD_WATCH_MS = 2500;

// Настройки мини-игры «поймай монету»
const COIN_REWARD = 1;
const SPIKE_PENALTY = 5;
const FIELD_HEIGHT = 220;
const ITEM_SIZE = 34;
const CATCHER_WIDTH = 88;
const CATCHER_HEIGHT = 18;
const CATCHER_BOTTOM = 14;
const SPAWN_INTERVAL_MS = 620;
const SPIKE_CHANCE = 0.32;
const MIN_SPEED = 90;   // px/сек
const MAX_SPEED = 165;  // px/сек
const KEY_STEP = 26;

// Бонусная фиолетовая монета
const RAIN_DURATION_MS = 5000;
const RAIN_SPAWN_INTERVAL_MS = 70;
const RAIN_COIN_SPEED_MIN = 200;
const RAIN_COIN_SPEED_MAX = 400;
const RAIN_COIN_CHANCE = 0.045;

function CloseIcon() {
    // Точная иконка крестика с сайта (css-p0gsx7)
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1.17282 12C0.514893 12 0 11.4702 0 10.8115C0 10.4964 0.114414 10.1957 0.343257 9.98084L4.3051 5.99999L0.343257 2.0334C0.114414 1.8043 0 1.51789 0 1.20286C0 0.529821 0.514893 0.0286375 1.17282 0.0286375C1.50178 0.0286375 1.75923 0.143189 1.98807 0.357995L5.97852 4.3389L9.99761 0.343668C10.2407 0.100239 10.4982 0 10.8128 0C11.4707 0 12 0.515509 12 1.17422C12 1.50358 11.8998 1.76133 11.6423 2.01909L7.66626 5.99999L11.6281 9.96661C11.8713 10.1814 11.9856 10.482 11.9856 10.8115C11.9856 11.4702 11.4565 12 10.7842 12C10.4553 12 10.1549 11.8855 9.94034 11.6563L5.97852 7.67544L2.03097 11.6563C1.80214 11.8855 1.50178 12 1.17282 12Z" fill="white" fillOpacity="0.4"/>
        </svg>
    );
}

function CoinIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="rgba(192, 147, 16, 0.18)" stroke="#C09310" strokeWidth="1.4"/>
            <path d="M12 7v10M9.2 9.4c0-1.1 1.1-2 2.8-2s2.8.9 2.8 2c0 2.2-5.6 1.3-5.6 3.6 0 1.1 1.1 2 2.8 2s2.8-.9 2.8-2"
                  stroke="#C09310" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function SpikeIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1.6 14.4 7l5.4-1.6-3.2 4.6 4.6 3.2-5.4 1.4 1.6 5.4-4.6-3.2-3.2 4.6-1.4-5.4-5.4 1.6L5.6 13 1 9.8l5.4-1.4L4.8 3l4.6 3.2L12 1.6Z"
                  fill="rgba(255, 77, 106, 0.22)" stroke="#FF4D6A" strokeWidth="1.4" strokeLinejoin="round"/>
        </svg>
    );
}

function AdIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 15.5v-7Z"
                  stroke="currentColor" strokeWidth="1.4"/>
            <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor"/>
        </svg>
    );
}



const playCoin = () => {
    const audio = new Audio("./assets/tish.mp3");
    audio.play().catch(error => console.log('Ошибка воспроизведения:', error));
};

const playSpike = () => {
    const audio = new Audio("./assets/ao.mp3");
    audio.play().catch(error => console.log('Ошибка воспроизведения:', error));
};

export default function DepositModal({ isOpen, onClose, coins, onAddCoins }) {
    const [pulses, setPulses] = useState([]);
    const [items, setItems] = useState([]);
    const [catcherX, setCatcherX] = useState(0);
    const [stats, setStats] = useState({ coins: 0, spikes: 0 });
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const [adProgress, setAdProgress] = useState(0);
    const [isFieldActive, setIsFieldActive] = useState(false); // курсор наведён на поле — управляет оверлеем паузы

    const toastRef = useRef(null);
    const pulseIdRef = useRef(0);
    const itemIdRef = useRef(0);
    const fieldRef = useRef(null);
    const itemsRef = useRef([]);
    const catcherXRef = useRef(0);
    const coinsRef = useRef(coins);
    const addCoinsRef = useRef(onAddCoins);
    const gameRef = useRef({ rafId: null, lastTs: 0, spawnAcc: 0, elapsed: 0 });
    const adTimerRef = useRef(null);
    const adProgressRef = useRef(null);
    const isWatchingAdRef = useRef(false);
    const pointerInsideRef = useRef(false);
    const isPointerLockedRef = useRef(false);
    const rainRef = useRef({ active: false, elapsed: 0, spawnAcc: 0 });

    // Игровой цикл живёт в одном requestAnimationFrame — свежие значения берём через ref
    coinsRef.current = coins;
    addCoinsRef.current = onAddCoins;
    isWatchingAdRef.current = isWatchingAd;

    useEffect(() => {
        if (!isOpen) return;

        function handleKeyDown(event) {
            if (event.key === 'Escape' && !isWatchingAd) {
                if (document.pointerLockElement) {
                    document.exitPointerLock();
                    return;
                }

                rainRef.current.active = false;
                onClose();
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isWatchingAd, onClose]);

    // Игровой цикл: пока модалка открыта, сверху вниз падают монеты и колючки
    useEffect(() => {
        if (!isOpen) return;

        const startWidth = fieldRef.current ? fieldRef.current.clientWidth : 0;
        catcherXRef.current = startWidth / 2;
        setCatcherX(startWidth / 2);

        pointerInsideRef.current = false; // ждём наведения курсора
        setIsFieldActive(false);
        itemsRef.current = [];
        setItems([]);
        setStats({ coins: 0, spikes: 0 });
        gameRef.current = { rafId: null, lastTs: 0, spawnAcc: SPAWN_INTERVAL_MS, elapsed: 0 };
        rainRef.current = { active: false, elapsed: 0, spawnAcc: 0 };
        gameRef.current.rafId = requestAnimationFrame(step);

        return () => cancelAnimationFrame(gameRef.current.rafId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Гасим таймеры рекламы при размонтировании
    useEffect(() => {
        return () => {
            clearTimeout(adTimerRef.current);
            clearInterval(adProgressRef.current);
        };
    }, []);

    // Pointer Lock — источник истины для состояния игры
    useEffect(() => {
        if (!isOpen) return;

        const handlePointerLockChange = () => {
            const locked = document.pointerLockElement === fieldRef.current;

            isPointerLockedRef.current = locked;
            pointerInsideRef.current = locked;
            setIsFieldActive(locked);
        };

        document.addEventListener('pointerlockchange', handlePointerLockChange);

        return () => {
            document.removeEventListener('pointerlockchange', handlePointerLockChange);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    function lockPointer() {
        const field = fieldRef.current;
        if (!field || isPointerLockedRef.current) return;

        field.requestPointerLock();
    }

    function spawnPulse(x, y, text, kind) {
        const id = pulseIdRef.current++;
        setPulses((prev) => [...prev, { id, x, y, text, kind }]);
        setTimeout(() => {
            setPulses((prev) => prev.filter((p) => p.id !== id));
        }, 700);
    }

    function spawnItem(width, type = null, speed = null) {
        const itemType = type ?? (() => {
            const roll = Math.random();
            if (roll < SPIKE_CHANCE) return 'spike';
            if (roll < SPIKE_CHANCE + RAIN_COIN_CHANCE) return 'rain';
            return 'coin';
        })();

        // Чем дольше играешь, тем быстрее падает
        const speedMul = 1 + Math.min(gameRef.current.elapsed / 60000, 0.8);
        itemsRef.current.push({
            id: itemIdRef.current++,
            type: itemType,
            x: Math.random() * Math.max(0, width - ITEM_SIZE),
            y: -ITEM_SIZE,
            speed: speed ?? ((MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED)) * speedMul),
            spin: Math.random() * 360,
        });
    }

    function startCoinRain() {
        const field = fieldRef.current;
        if (!field) return;

        // Убираем все уже летящие колючки. Во время дождя новые тоже не появятся.
        itemsRef.current = itemsRef.current.filter((item) => item.type !== 'spike');
        rainRef.current = {
            active: true,
            elapsed: 0,
            spawnAcc: RAIN_SPAWN_INTERVAL_MS,
        };
        spawnPulse(field.clientWidth / 2, FIELD_HEIGHT * 0.35, 'ДОЖДЬ МОНЕТ!', 'rain');
    }

    function catchItem(item) {
        const centerX = item.x + ITEM_SIZE / 2;
        const centerY = item.y + ITEM_SIZE / 2;

        if (item.type === 'coin') {
            addCoinsRef.current(COIN_REWARD);
            setStats((prev) => ({ ...prev, coins: prev.coins + 1 }));
            spawnPulse(centerX, centerY, `+${COIN_REWARD}`, 'coin');
            playCoin();
            return;
        }

        if (item.type === 'rain') {
            startCoinRain();
            playCoin();
            return;
        }

        // Колючка: штраф, но баланс не уводим в минус
        const penalty = Math.min(SPIKE_PENALTY, Math.max(0, coinsRef.current));
        if (penalty > 0) addCoinsRef.current(-penalty);
        setStats((prev) => ({ ...prev, spikes: prev.spikes + 1 }));
        spawnPulse(centerX, centerY, `-${penalty}`, 'spike');
        playSpike();
    }

    function step(ts) {
        const game = gameRef.current;
        const field = fieldRef.current;
        if (!field) return;

        const dt = game.lastTs ? Math.min((ts - game.lastTs) / 1000, 0.05) : 0;
        game.lastTs = ts;

        const isPaused = isWatchingAdRef.current || !pointerInsideRef.current;
        if (isPaused) {
            game.rafId = requestAnimationFrame(step);
            return; // не двигаем предметы, не спавним, не считаем elapsed
        }

        game.elapsed += dt * 1000;

        const catcherLeft = catcherXRef.current - CATCHER_WIDTH / 2;
        const catcherRight = catcherXRef.current + CATCHER_WIDTH / 2;
        const catcherTop = FIELD_HEIGHT - CATCHER_BOTTOM - CATCHER_HEIGHT;

        if (rainRef.current.active) {
            rainRef.current.elapsed += dt * 1000;

            if (rainRef.current.elapsed >= RAIN_DURATION_MS) {
                rainRef.current.active = false;
                rainRef.current.elapsed = 0;
                rainRef.current.spawnAcc = 0;
            } else {
                rainRef.current.spawnAcc += dt * 1000;

                if (rainRef.current.spawnAcc >= RAIN_SPAWN_INTERVAL_MS) {
                    rainRef.current.spawnAcc = 0;
                    spawnItem(
                        field.clientWidth,
                        'coin',
                        RAIN_COIN_SPEED_MIN +
                        Math.random() * (RAIN_COIN_SPEED_MAX - RAIN_COIN_SPEED_MIN)
                    );
                }
            }
        } else {
            game.spawnAcc += dt * 1000;

            if (game.spawnAcc >= SPAWN_INTERVAL_MS) {
                game.spawnAcc = 0;
                spawnItem(field.clientWidth);
            }
        }

        const next = [];
        for (const item of itemsRef.current) {
            item.y += item.speed * dt;

            const overlapY = item.y + ITEM_SIZE >= catcherTop && item.y <= catcherTop + CATCHER_HEIGHT;
            const overlapX = item.x + ITEM_SIZE > catcherLeft && item.x < catcherRight;

            if (overlapY && overlapX) {
                catchItem(item);
                continue;
            }
            // Промазал — предмет просто улетает вниз
            if (item.y < FIELD_HEIGHT) next.push(item);
        }

        itemsRef.current = next;
        setItems(next.map((item) => ({ ...item })));

        game.rafId = requestAnimationFrame(step);
    }

    function moveCatcherTo(x) {
        const field = fieldRef.current;
        if (!field) return;
        const half = CATCHER_WIDTH / 2;
        const clamped = Math.max(half, Math.min(field.clientWidth - half, x));
        catcherXRef.current = clamped;
        setCatcherX(clamped);
    }

    function handlePointerMove(event) {
        if (!isPointerLockedRef.current) return;

        moveCatcherTo(catcherXRef.current + event.movementX);
    }

    function handleFieldClick() {
        if (!isPointerLockedRef.current) {
            lockPointer();
        }
    }

    function handleFieldKeyDown(event) {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            moveCatcherTo(catcherXRef.current - KEY_STEP);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            moveCatcherTo(catcherXRef.current + KEY_STEP);
        }
    }

    function handleWatchAd() {
        if (isWatchingAd) return;

        setIsWatchingAd(true);
        setAdProgress(0);

        const startedAt = Date.now();
        adProgressRef.current = setInterval(() => {
            const pct = Math.min(100, ((Date.now() - startedAt) / AD_WATCH_MS) * 100);
            setAdProgress(pct);
        }, 50);

        adTimerRef.current = setTimeout(() => {
            clearInterval(adProgressRef.current);
            setIsWatchingAd(false);
            setAdProgress(0);
            onAddCoins(AD_REWARD);
            toastRef.current?.show(`Получено ${AD_REWARD.toLocaleString('ru-RU')} монет`, { type: 'success' });
        }, AD_WATCH_MS);
    }

    function handleOverlayClick() {
        if (!isWatchingAd) onClose();
    }

    const isPaused = isWatchingAd || !isFieldActive;

    return (
        <div className="deposit-positioner" onClick={handleOverlayClick}>
            <div
                className="deposit-content"
                role="dialog"
                aria-modal="true"
                aria-labelledby="deposit-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="deposit-head">
                    <div/>
                    <h2 id="deposit-modal-title" className="deposit-title">Депозит</h2>
                    <button
                        type="button"
                        className="deposit-close"
                        onClick={onClose}
                        aria-label="Закрыть"
                        disabled={isWatchingAd}
                    >
                        <CloseIcon/>
                    </button>
                </div>

                <div className="deposit-body">
                    <div className="deposit-balance">
                        <CoinIcon className="deposit-balance-icon"/>
                        <span className="deposit-balance-value">{coins.toLocaleString('ru-RU')}</span>
                    </div>

                    <div
                        ref={fieldRef}
                        className="deposit-game"
                        style={{ height: FIELD_HEIGHT }}
                        role="application"
                        tabIndex={0}
                        aria-label="Мини-игра: лови монеты и уворачивайся от колючек"
                        onPointerEnter={() => {
                            if (!isPointerLockedRef.current) {
                                handleFieldClick();
                            }
                        }}
                        onPointerDown={handleFieldClick}
                        onPointerMove={handlePointerMove}
                        onKeyDown={handleFieldKeyDown}
                    >
                        <div className={`deposit-game-play ${isPaused ? 'is-paused' : ''}`}>
                            <div className="deposit-game-grid"/>

                            {items.map((item) => (
                                <span
                                    key={item.id}
                                    className={`deposit-game-item ${
                                        item.type === 'coin' ? 'is-coin' :
                                            item.type === 'rain' ? 'is-rain' : 'is-spike'
                                    }`}
                                    style={{
                                        width: ITEM_SIZE,
                                        height: ITEM_SIZE,
                                        transform: `translate3d(${item.x}px, ${item.y}px, 0) rotate(${item.spin + item.y * (item.type === 'spike' ? 1.6 : 0.4)}deg)`,
                                    }}
                                >
                                    {item.type === 'coin' || item.type === 'rain'
                                        ? <CoinIcon className="deposit-game-item-icon"/>
                                        : <SpikeIcon className="deposit-game-item-icon"/>}
                                </span>
                            ))}

                            <div
                                className="deposit-game-catcher"
                                style={{
                                    width: CATCHER_WIDTH,
                                    height: CATCHER_HEIGHT,
                                    bottom: CATCHER_BOTTOM,
                                    transform: `translate3d(${catcherX - CATCHER_WIDTH / 2}px, 0, 0)`,
                                }}
                            />

                            <div className="deposit-game-stats">
                                <span className="deposit-game-stat is-coin">+{stats.coins}</span>
                                <span className="deposit-game-stat is-spike">−{stats.spikes * SPIKE_PENALTY}</span>
                            </div>
                            <span className="deposit-game-esc-hint">ESC — выйти из игры</span>

                            {pulses.map((p) => (
                                <span
                                    key={p.id}
                                    className={`deposit-coin-pulse ${p.kind === 'spike' ? 'is-spike' : ''}`}
                                    style={{ left: p.x, top: p.y }}
                                >
                                    {p.text}
                                </span>
                            ))}
                        </div>

                        <div className={`deposit-game-pause ${isPaused ? 'is-visible' : ''}`}>
                            <div className="deposit-game-pause-legend">
                                <span className="deposit-game-pause-chip is-coin">
                                    <CoinIcon className="deposit-game-pause-chip-icon"/>
                                    +{COIN_REWARD}
                                </span>
                                <span className="deposit-game-pause-chip is-spike">
                                    <SpikeIcon className="deposit-game-pause-chip-icon"/>
                                    −{SPIKE_PENALTY}
                                </span>
                            </div>
                            <span className="deposit-game-pause-text">
                                {isWatchingAd ? 'Игра на паузе, идёт реклама' : 'Нажмите на поле, чтобы играть'}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="deposit-ad-button"
                        onClick={handleWatchAd}
                        disabled={isWatchingAd}
                    >
                        {isWatchingAd ? (
                            <div className="deposit-ad-progress-track">
                                <div className="deposit-ad-progress-fill" style={{ width: `${adProgress}%` }}/>
                                <span className="deposit-ad-progress-label">Идёт реклама…</span>
                            </div>
                        ) : (
                            <>
                                <AdIcon className="deposit-ad-icon"/>
                                <span>Получить {AD_REWARD}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <Toast ref={toastRef}/>
        </div>
    );
}