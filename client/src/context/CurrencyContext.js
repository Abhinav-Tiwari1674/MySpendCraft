import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from './AuthContext';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [currency, setCurrency] = useState('INR');
    const [country, setCountry] = useState('India');

    // Static Conversion Rates (Base: INR)
    const rates = {
        INR: { rate: 1, symbol: '₹', locale: 'en-IN' },
        USD: { rate: 0.012, symbol: '$', locale: 'en-US' },
        GBP: { rate: 0.0094, symbol: '£', locale: 'en-GB' },
        EUR: { rate: 0.011, symbol: '€', locale: 'de-DE' },
        JPY: { rate: 1.82, symbol: '¥', locale: 'ja-JP' },
        AUD: { rate: 0.018, symbol: 'A$', locale: 'en-AU' },
        CAD: { rate: 0.016, symbol: 'C$', locale: 'en-CA' }
    };

    // Load initial settings
    useEffect(() => {
        // Migration: Check for new key, then fallback to old key
        const savedCurrency = localStorage.getItem('myspendcraft_currency');
        const savedCountry = localStorage.getItem('myspendcraft_country');

        if (user && user.preferences) {
            setCurrency(user.preferences.currency || 'INR');
            setCountry(user.preferences.country || 'India');
        } else if (savedCurrency) {
            setCurrency(savedCurrency);
            setCountry(savedCountry || 'India');
        }
    }, [user]);

    const changeCurrency = async (newCurrency, newCountry) => {
        setCurrency(newCurrency);
        setCountry(newCountry);
        localStorage.setItem('myspendcraft_currency', newCurrency);
        localStorage.setItem('myspendcraft_country', newCountry);

        if (user) {
            try {
                await api.put('/auth/preferences', {
                    currency: newCurrency,
                    country: newCountry
                });
            } catch (error) {
                console.error('Failed to save currency preference:', error);
            }
        }
    };

    const formatCurrency = (amount) => {
        const current = rates[currency] || rates['INR'];
        const converted = amount * current.rate;

        return new Intl.NumberFormat(current.locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(converted);
    };

    const getSymbol = () => {
        return rates[currency]?.symbol || '₹';
    };

    return (
        <CurrencyContext.Provider value={{
            currency,
            country,
            changeCurrency,
            formatCurrency,
            getSymbol,
            ratesList: Object.keys(rates).map(key => ({ code: key, ...rates[key] }))
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export default CurrencyContext;
