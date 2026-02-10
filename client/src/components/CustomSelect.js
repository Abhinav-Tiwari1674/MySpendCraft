import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const CustomSelect = ({ value, options, onChange, label, placeholder = 'Select an option...', width = '140px' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="custom-select-container" ref={ref} style={{ width, position: 'relative', zIndex: isOpen ? 10000 : 1 }}>
            {label && <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</label>}
            <div
                className={`custom-select ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                style={{ height: '44px', background: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
                <span style={{ fontSize: '13px', color: value ? 'white' : 'rgba(255,255,255,0.3)' }}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <FaChevronDown className="arrow" style={{ fontSize: '12px', opacity: 0.6 }} />
            </div>
            <div className={`custom-options ${isOpen ? 'open' : ''}`}>
                {options.map((option) => (
                    <div
                        key={option.value}
                        className={`custom-option ${value === option.value ? 'selected' : ''}`}
                        onClick={() => {
                            onChange(option.value);
                            setIsOpen(false);
                        }}
                    >
                        {option.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomSelect;
