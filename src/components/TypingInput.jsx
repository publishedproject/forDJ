import React, { useRef, useEffect, useState } from 'react';
import styles from '../styles/TypingInput.module.css';

const TypingInput = ({ 
  value = '', 
  onChange, 
  onSubmit,
  onCtrlEnter,
  disabled = false 
}) => {
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [focusAttempts, setFocusAttempts] = useState(0);

  // Function to safely focus the input
  const focusInput = () => {
    if (disabled || !inputRef.current) return;
    
    try {
      inputRef.current.focus();
      setIsFocused(true);
    } catch (e) {
      console.error("Error focusing input:", e);
      
      // Retry focus with incremental backoff if needed
      if (focusAttempts < 3) {
        const timeout = setTimeout(() => {
          setFocusAttempts(prev => prev + 1);
        }, 300 * (focusAttempts + 1));
        
        return () => clearTimeout(timeout);
      }
    }
  };

  // Focus input when component mounts or disabled state changes
  useEffect(() => {
    if (!disabled) {
      focusInput();
    }
  }, [disabled, focusAttempts]);

  // Safeguard against input value not being initialized
  const safeValue = value === null || value === undefined ? '' : value;

  // Handle input changes
  const handleChange = (e) => {
    if (disabled) return;
    
    try {
      if (onChange) {
        onChange(e.target.value);
      }
    } catch (e) {
      console.error("Error in input change handler:", e);
    }
  };

  // Handle key presses
  const handleKeyDown = (e) => {
    if (disabled) return;
    
    try {
      // Submit ONLY on Ctrl+Enter key combination
      if (e.key === 'Enter' && e.ctrlKey && onCtrlEnter) {
        e.preventDefault();
        onCtrlEnter();
        return;
      }
      
      // Prevent default behavior for regular Enter key to avoid form submission
      if (e.key === 'Enter') {
        e.preventDefault();
        // No submission on regular Enter key
      }
    } catch (e) {
      console.error("Error in key down handler:", e);
    }
  };

  // Handle focus events
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Focus the input when the container is clicked
  const handleContainerClick = () => {
    focusInput();
  };

  return (
    <div 
      className={`${styles.inputContainer} ${isFocused ? styles.focused : ''}`}
      onClick={handleContainerClick}
      data-testid="typing-input-container"
    >
      <input
        ref={inputRef}
        type="text"
        className={styles.typingInput}
        value={safeValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={disabled ? "Waiting for test to start..." : "Start typing here..."}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        data-testid="typing-input"
      />
      
      {disabled && (
        <div className={styles.disabledOverlay}>
          <span>Please select a mode to start typing</span>
        </div>
      )}
      
      {!disabled && isFocused && (
        <div className={styles.typingIndicator}>
          <span className={styles.typingDot}></span>
          <span className={styles.typingText}>Typing</span>
        </div>
      )}
      
      <div className={styles.inputInstructions}>
        Press Ctrl+Enter or use Submit button when finished
      </div>
    </div>
  );
};

export default TypingInput; 