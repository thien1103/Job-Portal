import React from 'react';

const Switch = ({ checked, onCheckedChange }) => {
    return (
        <button
            type="button"
            onClick={() => onCheckedChange(!checked)}
            className={`relative inline-flex h-[24px] w-[44px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out 
                ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
            aria-pressed={checked}
        >
            <span
                className={`inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
    );
};

export { Switch };
