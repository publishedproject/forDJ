import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/SentenceDisplay.module.css';
import AdvancedCursor from './AdvancedCursor';

const SentenceDisplay = ({ 
  sentence = '', 
  userInput = '', 
  mode = 'standard'
}) => {
  try {
    // State for UI elements
    const [guidance, setGuidance] = useState('');
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [charMeasurements, setCharMeasurements] = useState([]);
    const [charStatus, setCharStatus] = useState([]);
    const [progress, setProgress] = useState(0);
    const [isMeasured, setIsMeasured] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    
    // Refs
    const containerRef = useRef(null);
    const charRefs = useRef([]);
    
    // Connection paths for reversed characters
    const [connections, setConnections] = useState([]);
    
    // Initialize character refs array
    useEffect(() => {
      charRefs.current = charRefs.current.slice(0, sentence.length);
    }, [sentence]);
    
    // Update guidance text based on mode
    useEffect(() => {
      switch(mode) {
        case 'standard':
          setGuidance('Type the text as it appears');
          break;
        case 'reverse':
          setGuidance('Type the text in normal reading order');
          break;
        case 'jumbled':
          setGuidance('Unscramble and type the text correctly');
          break;
        default:
          setGuidance('Type the text as it appears');
      }
    }, [mode]);
    
    // Measure character positions for cursor placement with retry logic
    useEffect(() => {
      if (!sentence || sentence.length === 0) return;
      
      // Clear previous measurements
      setCharMeasurements([]);
      setIsMeasured(false);
      
      const measureChars = () => {
        if (!containerRef.current) return false;
        
        try {
          const containerRect = containerRef.current.getBoundingClientRect();
          const measurements = [];
          
          let validMeasurements = 0;
          for (let i = 0; i < charRefs.current.length; i++) {
            const ref = charRefs.current[i];
            if (!ref) {
              measurements.push(null);
              continue;
            }
            
            try {
              const rect = ref.getBoundingClientRect();
              if (rect.width === 0 && rect.height === 0) {
                measurements.push(null);
                continue;
              }
              
              measurements.push({
                left: rect.left - containerRect.left,
                top: rect.top - containerRect.top,
                width: rect.width,
                height: rect.height,
                centerY: rect.top - containerRect.top + rect.height / 2
              });
              validMeasurements++;
            } catch (e) {
              console.error("Error measuring character:", e);
              measurements.push(null);
            }
          }
          
          if (validMeasurements > 0) {
            setCharMeasurements(measurements);
            setIsMeasured(true);
            return true;
          }
          return false;
        } catch (e) {
          console.error("Error in measuring characters:", e);
          return false;
        }
      };
      
      // Try immediately
      const success = measureChars();
      
      // If not successful, try again after a delay (helps with rendering timing)
      if (!success) {
        const timerId = setTimeout(() => {
          if (measureChars()) {
            setRetryCount(0);
          } else if (retryCount < 3) {
            setRetryCount(prev => prev + 1);
          }
        }, 300);
        
        return () => clearTimeout(timerId);
      }
    }, [sentence, retryCount]);
    
    // Calculate connections for reverse mode
    useEffect(() => {
      if (mode !== 'reverse' || !isMeasured || userInput.length === 0) return;
      
      try {
        const newConnections = [];
        
        for (let i = 0; i < userInput.length && i < sentence.length; i++) {
          const targetIndex = sentence.length - i - 1;
          
          if (targetIndex >= 0 && targetIndex < charMeasurements.length && 
              charMeasurements[targetIndex]) {
            
            const source = charMeasurements[targetIndex];
            const target = {
              left: 20, // Position on the left side
              centerY: source.centerY
            };
            
            newConnections.push({
              x1: source.left,
              y1: source.centerY,
              x2: target.left,
              y2: target.centerY,
              status: charStatus[targetIndex] || 'pending'
            });
          }
        }
        
        setConnections(newConnections);
      } catch (e) {
        console.error("Error calculating connections:", e);
      }
    }, [mode, charMeasurements, userInput, charStatus, sentence, isMeasured]);
    
    // Update character status based on user input
    useEffect(() => {
      if (!sentence || sentence.length === 0) return;
      
      try {
        const newStatus = Array(sentence.length).fill('pending');
        
        // Skip feedback for jumbled mode by leaving all characters as 'pending'
        if (mode === 'jumbled') {
          setCharStatus(newStatus);
          return;
        }
        
        if (mode === 'reverse') {
          // For reverse mode, compare with reversed sentence
          const reversedSentence = sentence.split('').reverse().join('');
          for (let i = 0; i < userInput.length && i < reversedSentence.length; i++) {
            const reversedIndex = sentence.length - i - 1;
            if (reversedIndex >= 0 && reversedIndex < newStatus.length) {
              newStatus[reversedIndex] = 
                reversedSentence[i] === userInput[i] ? 'correct' : 'incorrect';
            }
          }
        } else {
          // Standard comparison left to right
          for (let i = 0; i < userInput.length && i < sentence.length; i++) {
            newStatus[i] = sentence[i] === userInput[i] ? 'correct' : 'incorrect';
          }
        }
        
        setCharStatus(newStatus);
        
        // Calculate progress
        if (sentence.length > 0) {
          setProgress((userInput.length / sentence.length) * 100);
        }
      } catch (e) {
        console.error("Error updating character status:", e);
      }
    }, [userInput, mode, sentence]);
    
    // Update cursor position
    useEffect(() => {
      // Skip cursor updates for jumbled mode - keep cursor at default position
      if (mode === 'jumbled') {
        if (charMeasurements && charMeasurements[0]) {
          const firstPos = charMeasurements[0];
          setCursorPosition({
            x: firstPos.left - 2,
            y: firstPos.centerY - (firstPos.height / 2)
          });
        }
        return;
      }
      
      if (!isMeasured || charMeasurements.length === 0) return;
      
      try {
        if (userInput.length > 0 && userInput.length <= sentence.length) {
          let indexToUse = mode === 'reverse' 
            ? sentence.length - userInput.length
            : userInput.length - 1;
          
          // Boundary check
          indexToUse = Math.max(0, Math.min(indexToUse, charMeasurements.length - 1));
          
          const pos = charMeasurements[indexToUse];
          if (pos) {
            if (mode === 'reverse') {
              // In reverse mode, cursor appears before the character
              setCursorPosition({ 
                x: pos.left - 2, 
                y: pos.centerY - (pos.height / 2) 
              });
            } else {
              // In standard mode, cursor appears after the character
              setCursorPosition({ 
                x: pos.left + pos.width, 
                y: pos.centerY - (pos.height / 2) 
              });
            }
          }
        } else {
          // Set cursor at the beginning or end based on mode
          if (mode === 'reverse' && charMeasurements[charMeasurements.length - 1]) {
            const lastPos = charMeasurements[charMeasurements.length - 1];
            setCursorPosition({
              x: lastPos.left - 2,
              y: lastPos.centerY - (lastPos.height / 2)
            });
          } else if (charMeasurements[0]) {
            const firstPos = charMeasurements[0];
            setCursorPosition({
              x: firstPos.left - 2,
              y: firstPos.centerY - (firstPos.height / 2)
            });
          }
        }
      } catch (e) {
        console.error("Error updating cursor position:", e);
      }
    }, [userInput, mode, sentence, charMeasurements, isMeasured]);

    // Calculate cursor status with additional safety
    const getCursorStatus = () => {
      try {
        // Always use default cursor for jumbled mode
        if (mode === 'jumbled') return 'default';
        
        // Exit early if no input
        if (!userInput || userInput.length === 0) return 'default';
        
        // No status array yet
        if (!charStatus || charStatus.length === 0) return 'default';
        
        // Calculate correct index based on mode
        const index = mode === 'reverse' 
          ? sentence.length - userInput.length
          : userInput.length - 1;
        
        // Bounds checking
        if (index < 0 || index >= charStatus.length) return 'default';
        
        // Return appropriate status
        return charStatus[index] === 'correct' ? 'typing' : 'error';
      } catch (e) {
        console.error("Error calculating cursor status:", e);
        return 'default'; // Safe fallback
      }
    };
    
    // If sentence is empty, show placeholder
    if (!sentence || sentence.length === 0) {
      return (
        <div className={styles.sentenceContainer}>
          <div className={styles.guidance}>Loading content...</div>
          <div className={styles.sentenceArea} ref={containerRef}>
            <div className={styles.sentenceText}>
              <span className={styles.placeholder}>Waiting for content to load...</span>
            </div>
          </div>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: '0%' }} />
          </div>
        </div>
      );
    }
    
    // Main component render
    return (
      <div className={styles.sentenceContainer}>
        <div className={styles.guidance}>
          {guidance}
          
          {mode === 'reverse' && (
            <div className={styles.reverseIndicator}>
              <span className={styles.arrow}>←</span>
              <span className={styles.reverseLabel}>Reverse Mode</span>
              <span className={styles.arrow}>←</span>
            </div>
          )}
        </div>
        
        <div className={styles.sentenceArea} ref={containerRef}>
          {/* SVG layer for connections in reverse mode */}
          {mode === 'reverse' && connections.length > 0 && (
            <svg className={styles.connectionSvg}>
              {connections.map((conn, i) => (
                <motion.path
                  key={`conn-${i}`}
                  d={`M${conn.x1},${conn.y1} L${conn.x2},${conn.y2}`}
                  stroke={conn.status === 'correct' ? '#10b981' : '#ef4444'}
                  strokeWidth="1"
                  strokeDasharray="3,2"
                  strokeOpacity="0.4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </svg>
          )}
          
          <div className={styles.sentenceText}>
            {sentence.split('').map((char, index) => {
              // Check if this character is followed by a space (indicating end of word)
              const isEndOfWord = sentence[index + 1] === ' ' || index === sentence.length - 1;
              
              // Add special class for reverse mode
              const isReverseMode = mode === 'reverse';
              
              return (
                <span
                  key={index}
                  ref={el => charRefs.current[index] = el}
                  className={`
                    ${styles.char} 
                    ${styles[charStatus[index] || 'pending']} 
                    ${isEndOfWord ? styles.wordSeparator : ''}
                    ${isReverseMode ? styles.reverseChar : ''}
                  `}
                  style={isReverseMode ? { transform: 'scale(-1, 1)' } : {}}
                >
                  {char}
                </span>
              );
            })}
          </div>
          
          {/* Advanced cursor - only render when fully ready */}
          {isMeasured && 
           cursorPosition && 
           typeof cursorPosition.x === 'number' && 
           typeof cursorPosition.y === 'number' && (
            <AdvancedCursor 
              isActive={true}
              isFocused={true}
              status={getCursorStatus()}
              position={cursorPosition}
              emitParticle={false}
              scale={1.2}
            />
          )}
        </div>
        
        {/* Progress bar */}
        <div className={styles.progressContainer}>
          <div 
            className={styles.progressBar} 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  } catch (error) {
    // Fallback render if anything crashes
    console.error("Critical error in SentenceDisplay:", error);
    return (
      <div className={styles.sentenceContainer}>
        <div className={styles.guidance}>
          Error displaying sentence
        </div>
        <div className={styles.sentenceArea}>
          <div className={styles.sentenceText}>
            <span className={styles.placeholder}>
              Please try again or select a different mode
            </span>
          </div>
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressBar} style={{ width: '0%' }} />
        </div>
      </div>
    );
  }
};

export default SentenceDisplay; 