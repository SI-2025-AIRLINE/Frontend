import React, { useState, useRef, useEffect } from 'react';

function SuggestionsInput({ label, value, placeholder, fetchSuggestions, onSelect }) {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const suggestionRefs = useRef([]);

    useEffect(() => {
        setFocusedIndex(-1);
    }, [suggestions]);

    useEffect(() => {
        if (focusedIndex >= 0 && suggestionRefs.current[focusedIndex]) {
            suggestionRefs.current[focusedIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [focusedIndex]);

    const handleInputChange = (e) => {
        const query = e.target.value;
        onSelect(query); // Update the parent state
        if (query.length > 0) {
            fetchSuggestions(query)
                .then((data) => {
                    setSuggestions(data);
                    setShowSuggestions(true);
                })
                .catch(() => setShowSuggestions(false));
        } else {
            setShowSuggestions(false);
        }
    };

    const handleKeyDown = (e) => {
        if (!showSuggestions) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex((prev) => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (focusedIndex >= 0) {
                    onSelect(suggestions[focusedIndex].airportCode);
                    setShowSuggestions(false);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                break;
            default:
                break;
        }
    };

    const handleSuggestionClick = (suggestion) => {
        onSelect(suggestion.airportCode);
        setShowSuggestions(false);
    };

    return (
        <div className="form-group airport-input-container">
            <label className="time-label">{label}</label>
            <input
                type="text"
                className="form-input"
                value={value}
                placeholder={placeholder}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onClick={() => setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            ref={(el) => (suggestionRefs.current[index] = el)}
                            className={`suggestion-item ${index === focusedIndex ? 'focused' : ''}`}
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion.name} ({suggestion.cityCode}) - {suggestion.airportCode}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SuggestionsInput;