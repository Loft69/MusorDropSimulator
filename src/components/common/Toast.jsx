import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import "../../styles/toast.css";

let toastIdCounter = 0;

/**
 * Универсальный компонент уведомлений.
 *
 * Использование в любом месте приложения:
 *
 *   const toastRef = useRef(null);
 *   toastRef.current.show('Готово!', { type: 'success' });
 *   ...
 *   return <>{...}<Toast ref={toastRef} /></>;
 *
 * type: 'success' | 'error' | 'info' (по умолчанию 'success')
 * duration: сколько мс показывать (по умолчанию 2600)
 */
const Toast = forwardRef(function Toast(_props, ref) {
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});

    const remove = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        clearTimeout(timers.current[id]);
        delete timers.current[id];
    }, []);

    useImperativeHandle(ref, () => ({
        show(message, options = {}) {
            const { type = 'success', duration = 2600 } = options;
            const id = ++toastIdCounter;

            setToasts((prev) => [...prev, { id, message, type }]);
            timers.current[id] = setTimeout(() => remove(id), duration);

            return id;
        },
        hide(id) {
            remove(id);
        },
    }), [remove]);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="toast-stack" onClick={(e) => e.stopPropagation()}>
            {toasts.map((t) => (
                <div key={t.id} className={`toast toast-${t.type}`} role="status">
                    <span className="toast-icon">
                        {t.type === 'success' ? '✓' : t.type === 'error' ? '!' : 'i'}
                    </span>
                    <span className="toast-message">{t.message}</span>
                </div>
            ))}
        </div>,
        document.body
    );
});

export default Toast;
