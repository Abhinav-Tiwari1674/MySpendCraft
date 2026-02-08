import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const CustomSelect = ({ value, options, onChange, label, width = '140px' }) => {
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

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className="custom-select-wrapper" ref={ref} style={{ width }}>
            {label && <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '700', textTransform: 'uppercase' }}>{label}</label>}
            <div
                className={`custom-select ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{selectedOption.label}</span>
                <FaChevronDown className="arrow" />
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
