import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import ModeSelection from './components/ModeSelection';
import SentenceDisplay from './components/SentenceDisplay';
import TypingInput from './components/TypingInput';
import AdvancedBackground from './components/AdvancedBackground';
import { sentences } from './data/sentences';
import resultsStyles from './styles/Results.module.css';

function App() {
  // Main app state - simplified to a single state variable
  const [appState, setAppState] = useState({
    screen: 'selecting', // 'selecting', 'typing', 'results'
    mode: null,
    displayedSentence: '',
    originalSentence: '',
    userInput: '',
    startTime: null,
    endTime: null,
    expectedInput: '',
    isLoading: false,
    error: null
  });

  // Log state changes for debugging
  useEffect(() => {
    console.log(`Screen changed to: ${appState.screen}`);
    
    // Debug output
    if (appState.screen === 'results') {
      console.log('Results state:', {
        startTime: appState.startTime,
        endTime: appState.endTime,
        originalSentence: appState.originalSentence,
        expectedInput: appState.expectedInput,
        userInput: appState.userInput?.substring(0, 20) + (appState.userInput?.length > 20 ? '...' : '')
      });
      
      // Safety check - if we're missing critical timing data, go back to selection screen
      if (!appState.startTime || !appState.endTime) {
        console.error("Missing timing data in results screen, returning to selection");
        setAppState(prev => ({
          ...prev,
          screen: 'selecting',
          error: "Couldn't process results due to timing issues. Please try again."
        }));
      }
    }
  }, [appState.screen, appState.startTime, appState.endTime, appState.originalSentence, appState.expectedInput, appState.userInput]);

  // Create memoized handlers to avoid recreation on each render
  const startTimer = useCallback(() => {
    try {
      if (!appState.startTime) {
        const now = Date.now();
        console.log("Timer started at:", now);
        setAppState(prev => ({
          ...prev,
          startTime: now
        }));
        return now;
      }
      return appState.startTime;
    } catch (err) {
      console.error("Error starting timer:", err);
      setAppState(prev => ({
        ...prev,
        error: "Failed to start timer"
      }));
      return Date.now();
    }
  }, [appState.startTime]);

  const stopTimer = useCallback(() => {
    try {
      if (appState.startTime && !appState.endTime) {
        const now = Date.now();
        console.log(`Timer stopped. Duration: ${(now - appState.startTime) / 1000}s`);
        setAppState(prev => ({
          ...prev,
          endTime: now
        }));
        return now;
      }
      return appState.endTime || Date.now(); // Return existing end time or current time
    } catch (err) {
      console.error("Error stopping timer:", err);
      setAppState(prev => ({
        ...prev,
        error: "Failed to stop timer"
      }));
      return Date.now();
    }
  }, [appState.startTime, appState.endTime]);

  // Handler for selecting a typing mode - without setTimeout to prevent race conditions
  const handleModeSelect = useCallback((mode) => {
    console.log(`Mode selected: ${mode}`);
    
    try {
      // Set loading state immediately
      setAppState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));
      
      // Short delay to show loading state
      setTimeout(() => {
        // Get a random sentence
        const randomIndex = Math.floor(Math.random() * sentences.length);
        const selectedSentence = sentences[randomIndex] || "Hello, world!";
        
        console.log("Selected sentence:", selectedSentence);
        
        // Determine display text based on mode
        let displayText = selectedSentence;
        let expected = selectedSentence;
        
        if (mode === 'reverse') {
          // Just reverse the order of characters without using special mirrored Unicode characters
          displayText = selectedSentence.split('').reverse().join('');
        } else if (mode === 'jumbled') {
          displayText = selectedSentence.split(' ').map(word => {
            if (word.length <= 2) return word;
            const middle = word.substring(1, word.length - 1).split('');
            for (let i = middle.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [middle[i], middle[j]] = [middle[j], middle[i]];
            }
            return word[0] + middle.join('') + word[word.length - 1];
          }).join(' ');
        }
        
        // Update state directly without additional setTimeout
        setAppState({
          screen: 'typing',
          mode: mode,
          displayedSentence: displayText,
          originalSentence: selectedSentence,
          expectedInput: expected,
          userInput: '',
          startTime: null,
          endTime: null,
          isLoading: false,
          error: null
        });
      }, 300);
    } catch (err) {
      console.error("Error in mode selection:", err);
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        error: "Failed to set up typing test"
      }));
    }
  }, []);

  // Handle input changes during typing
  const handleInputChange = useCallback((text) => {
    try {
      // Start timer on first keystroke
      let currentStartTime = appState.startTime;
      
      if (appState.userInput === '' && text.length > 0) {
        currentStartTime = Date.now();
        console.log("Timer started on first keystroke:", currentStartTime);
      }
      
      // Update state with start time if needed
      setAppState(prev => ({
        ...prev,
        userInput: text,
        startTime: prev.startTime || currentStartTime
      }));
      
      // Removed auto-submit functionality to only submit when user explicitly does so
    } catch (err) {
      console.error("Error in input handling:", err);
      setAppState(prev => ({
        ...prev,
        error: "Error processing your typing"
      }));
    }
  }, [appState.userInput, appState.startTime]);

  // Handle test submission
  const handleSubmit = useCallback(() => {
    try {
      console.log("Test manually submitted");
      
      // Always ensure we have both start and end time values
      const currentStartTime = appState.startTime || (Date.now() - 10000); // Fallback with 10s duration
      const endTimeValue = Date.now();
      
      console.log("CRITICAL STATE CHECK - Before Submission:", {
        mode: appState.mode,
        originalSentence: !!appState.originalSentence,
        expectedInput: !!appState.expectedInput,
        userInput: !!appState.userInput,
        displayedSentence: !!appState.displayedSentence,
        startTime: currentStartTime,
        endTime: endTimeValue,
        shouldWork: !!(appState.originalSentence && appState.expectedInput && currentStartTime && endTimeValue)
      });
      
      // Force a direct state update rather than relying on previous state to ensure consistency
      const newState = {
        screen: 'results',
        mode: appState.mode || 'standard',
        displayedSentence: appState.displayedSentence || '',
        originalSentence: appState.originalSentence || 'Default sentence',
        userInput: appState.userInput || '', // Ensure userInput is at least an empty string
        expectedInput: appState.expectedInput || appState.originalSentence || 'Default expected',
        startTime: currentStartTime,
        endTime: endTimeValue,
        isLoading: false,
        error: null
      };
      
      console.log("SETTING COMPLETE RESULTS STATE:", newState);
      
      // Use direct state assignment to avoid any dependency on previous state
      setAppState(newState);
      
    } catch (err) {
      console.error("Error in test submission:", err);
      alert("Error submitting test: " + err.message);
      setAppState(prev => ({
        ...prev,
        error: "Failed to submit test: " + err.message
      }));
    }
  }, [appState]);

  // Handle restarting the test
  const handleRestart = useCallback(() => {
    try {
      console.log('⏮️ Button clicked: Restarting test - returning to mode selection');
      
      // Force complete reset by reloading the page with a clean URL
      window.location.href = window.location.pathname;
      
    } catch (err) {
      console.error("Error in restart:", err);
      alert("Failed to restart test: " + err.message);
      
      // Ultimate fallback - reload the page
      window.location.reload();
    }
  }, []);

  // Handle restarting the test with the same mode
  const handleTryAgain = useCallback(() => {
    try {
      console.log('🔄 Try Again with same mode: ' + appState.mode);
      
      // Keep the same mode but start a new test
      const currentMode = appState.mode;
      
      if (!currentMode) {
        console.error("No mode set, returning to selection screen");
        handleRestart();
        return;
      }
      
      // Show loading briefly
      setAppState(prev => ({
        ...prev,
        isLoading: true
      }));
      
      // Short delay to show loading state
      setTimeout(() => {
        // Get a new random sentence
        const randomIndex = Math.floor(Math.random() * sentences.length);
        const selectedSentence = sentences[randomIndex] || "Hello, world!";
        
        console.log("New sentence for retry:", selectedSentence);
        
        // Determine display text based on mode
        let displayText = selectedSentence;
        let expected = selectedSentence;
        
        if (currentMode === 'reverse') {
          // Just reverse the order of characters without using special mirrored Unicode characters
          displayText = selectedSentence.split('').reverse().join('');
        } else if (currentMode === 'jumbled') {
          displayText = selectedSentence.split(' ').map(word => {
            if (word.length <= 2) return word;
            const middle = word.substring(1, word.length - 1).split('');
            for (let i = middle.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [middle[i], middle[j]] = [middle[j], middle[i]];
            }
            return word[0] + middle.join('') + word[word.length - 1];
          }).join(' ');
        }
        
        // Update state with new test but keep the mode
        setAppState({
          screen: 'typing',
          mode: currentMode,
          displayedSentence: displayText,
          originalSentence: selectedSentence,
          expectedInput: expected,
          userInput: '',
          startTime: null,
          endTime: null,
          isLoading: false,
          error: null
        });
        
        console.log(`Started new test with same mode: ${currentMode}`);
      }, 300);
    } catch (err) {
      console.error("Error in try again:", err);
      alert("Failed to start new test: " + err.message);
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        error: "Failed to start new test"
      }));
    }
  }, [appState.mode, handleRestart]);

  // Handle changing mode from results
  const handleChangeMode = useCallback(() => {
    try {
      console.log('🔄 Change Mode button clicked - returning to mode selection');
      
      // Force complete reset by reloading the page with a clean URL
      window.location.href = window.location.pathname;
      
    } catch (err) {
      console.error("Error in change mode:", err);
      alert("Failed to change mode: " + err.message);
      
      // Ultimate fallback - reload the page
      window.location.reload();
    }
  }, []);

  // Show loading state
  if (appState.isLoading) {
    return (
      <div className="app">
        <AdvancedBackground />
        <div className="loading">
          <div className="loadingSpinner"></div>
          <p>Loading your typing test...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (appState.error) {
    return (
      <div className="app">
        <AdvancedBackground />
        <div className="error">
          <h2>Something went wrong</h2>
          <p>{appState.error}</p>
          <button onClick={handleRestart}>Return to Mode Selection</button>
        </div>
      </div>
    );
  }

  // Render UI based on current app state
  return (
    <div className="app">
      <AdvancedBackground />
      
      <header className="header">
        <div className="appName">TypistFlow</div>
      </header>
      
      <main className="content">
        {appState.screen === 'selecting' && (
          <ModeSelection onSelectMode={handleModeSelect} />
        )}
        
        {appState.screen === 'typing' && appState.displayedSentence && (
          <div className="typingContainer">
            <div className="modeIndicator">
              Mode: {appState.mode === 'standard' ? 'Standard' : 
                     appState.mode === 'reverse' ? 'Reverse' : 'Jumbled'}
            </div>
            
            <SentenceDisplay 
              sentence={appState.displayedSentence}
              userInput={appState.userInput}
              mode={appState.mode}
            />
            
            <TypingInput 
              value={appState.userInput}
              onChange={handleInputChange}
              onCtrlEnter={handleSubmit}
              disabled={!appState.displayedSentence}
            />
            
            <button 
              className="submitButton" 
              onClick={handleSubmit}
              disabled={!appState.userInput.length}
            >
              Submit
            </button>
          </div>
        )}
        
        {appState.screen === 'results' && (
          <div className={resultsStyles.resultsContainer}>
            <h2 className={resultsStyles.resultsTitle}>Your Typing Results</h2>
            
            {/* Basic Results */}
            {appState.startTime && appState.endTime && appState.originalSentence ? (
              <div>
                <div className={resultsStyles.statsGrid}>
                  <div className={resultsStyles.statCard}>
                    <div className={`${resultsStyles.statValue} ${resultsStyles.wpm}`}>
                      {appState.userInput && appState.userInput.length > 0 
                        ? Math.round((appState.userInput.length / 5) / ((appState.endTime - appState.startTime) / 1000 / 60))
                        : 0}
                    </div>
                    <div className={resultsStyles.statLabel}>WPM</div>
                  </div>
                  <div className={resultsStyles.statCard}>
                    <div className={`${resultsStyles.statValue} ${resultsStyles.time}`}>
                      {((appState.endTime - appState.startTime) / 1000).toFixed(2)}s
                    </div>
                    <div className={resultsStyles.statLabel}>Time</div>
                  </div>
                </div>
                
                {/* Text Comparison with highlighting */}
                <div className={resultsStyles.textSection}>
                  <h4>Word Comparison:</h4>
                  <div 
                    className={`${resultsStyles.comparisonContainer} ${
                      appState.mode === 'jumbled' ? resultsStyles.jumbledComparison : 
                      appState.mode === 'reverse' ? resultsStyles.reverseComparison : 
                      ''
                    }`}
                  >
                    <div className={resultsStyles.comparisonRow}>
                      <span className={resultsStyles.comparisonLabel}>
                        Original Text:
                      </span>
                      <div className={resultsStyles.comparisonText}>
                        {/* Display the original text as a series of words */}
                        {appState.originalSentence.split(' ').map((word, wordIndex) => (
                          <span key={`expected-word-${wordIndex}`} className={resultsStyles.wordContainer}>
                            {word.split('').map((char, charIndex) => (
                              <span 
                                key={`expected-${wordIndex}-${charIndex}`} 
                                className={resultsStyles.expectedChar}
                              >
                                {char}
                              </span>
                            ))}
                            {/* Add space after each word except the last one */}
                            {wordIndex < appState.originalSentence.split(' ').length - 1 && (
                              <span className={resultsStyles.space}>&nbsp;</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Display what the user saw based on the mode */}
                    <div className={resultsStyles.comparisonRow}>
                      <span className={resultsStyles.comparisonLabel}>
                        {appState.mode === 'standard' ? 'What you saw:' : 
                         appState.mode === 'reverse' ? 'Reversed Text:' : 
                         'Jumbled Text:'}
                      </span>
                      <div className={resultsStyles.comparisonText}>
                        {/* Display the text that was shown to the user */}
                        {appState.displayedSentence.split(' ').map((word, wordIndex) => (
                          <span 
                            key={`displayed-word-${wordIndex}`} 
                            className={`${resultsStyles.wordContainer} ${appState.mode !== 'standard' ? resultsStyles.modifiedText : ''}`}
                          >
                            {word.split('').map((char, charIndex) => (
                              <span 
                                key={`displayed-${wordIndex}-${charIndex}`} 
                                className={`${resultsStyles.expectedChar} ${appState.mode === 'jumbled' ? resultsStyles.jumbledChar : appState.mode === 'reverse' ? resultsStyles.reversedChar : ''}`}
                              >
                                {char}
                              </span>
                            ))}
                            {/* Add space after each word except the last one */}
                            {wordIndex < appState.displayedSentence.split(' ').length - 1 && (
                              <span className={resultsStyles.space}>&nbsp;</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className={resultsStyles.comparisonRow}>
                      <span className={resultsStyles.comparisonLabel}>You typed:</span>
                      <div className={resultsStyles.comparisonText}>
                        {appState.userInput ? (
                          (() => {
                            // Split both original text and user input into words
                            const originalWords = appState.originalSentence.split(' ');
                            const typedWords = appState.userInput.split(' ');
                            
                            // Track which words are matched, extra, or missing
                            let matchedOriginalIndices = new Set();
                            let matchedTypedIndices = new Set();
                            
                            // First pass: find exact word matches
                            originalWords.forEach((originalWord, originalIndex) => {
                              if (typedWords.includes(originalWord)) {
                                const typedIndex = typedWords.findIndex((typedWord, idx) => 
                                  typedWord === originalWord && !matchedTypedIndices.has(idx)
                                );
                                
                                if (typedIndex !== -1) {
                                  matchedOriginalIndices.add(originalIndex);
                                  matchedTypedIndices.add(typedIndex);
                                }
                              }
                            });
                            
                            // Second pass: find close matches for non-matched words
                            originalWords.forEach((originalWord, originalIndex) => {
                              if (!matchedOriginalIndices.has(originalIndex)) {
                                // Find the best match among non-matched typed words
                                let bestMatchIndex = -1;
                                let bestMatchScore = 0;
                                
                                typedWords.forEach((typedWord, typedIndex) => {
                                  if (!matchedTypedIndices.has(typedIndex)) {
                                    // Calculate similarity score (simple version)
                                    const minLength = Math.min(originalWord.length, typedWord.length);
                                    let matchCount = 0;
                                    
                                    for (let i = 0; i < minLength; i++) {
                                      if (originalWord[i] === typedWord[i]) {
                                        matchCount++;
                                      }
                                    }
                                    
                                    const score = matchCount / Math.max(originalWord.length, typedWord.length);
                                    
                                    // Consider it a match if at least 60% similar
                                    if (score > 0.6 && score > bestMatchScore) {
                                      bestMatchScore = score;
                                      bestMatchIndex = typedIndex;
                                    }
                                  }
                                });
                                
                                if (bestMatchIndex !== -1) {
                                  matchedOriginalIndices.add(originalIndex);
                                  matchedTypedIndices.add(bestMatchIndex);
                                }
                              }
                            });
                            
                            // Render the typed words with appropriate status
                            return (
                              <div className={resultsStyles.wordsComparison}>
                                {typedWords.map((typedWord, typedIndex) => {
                                  let wordStatus = '';
                                  
                                  if (matchedTypedIndices.has(typedIndex)) {
                                    // Find the original word this matched with
                                    const originalIndex = [...matchedOriginalIndices].find(idx => 
                                      originalWords[idx] === typedWord || 
                                      !matchedTypedIndices.has(typedIndex)
                                    );
                                    
                                    // If it's an exact match
                                    if (originalWords[originalIndex] === typedWord) {
                                      wordStatus = resultsStyles.wordCorrect;
                                    } else {
                                      // It's a partial match
                                      wordStatus = resultsStyles.wordPartial;
                                    }
                                  } else {
                                    // It's an extra word
                                    wordStatus = resultsStyles.wordExtra;
                                  }
                                  
                                  return (
                                    <span 
                                      key={`typed-word-${typedIndex}`}
                                      className={`${resultsStyles.wordContainer} ${wordStatus}`}
                                    >
                                      {typedWord.split('').map((char, charIndex) => (
                                        <span 
                                          key={`typed-${typedIndex}-${charIndex}`} 
                                          className={resultsStyles.typedChar}
                                        >
                                          {char}
                                        </span>
                                      ))}
                                      {/* Add space after each word except the last one */}
                                      {typedIndex < typedWords.length - 1 && (
                                        <span className={resultsStyles.space}>&nbsp;</span>
                                      )}
                                    </span>
                                  );
                                })}
                                
                                {/* Show missing words */}
                                {originalWords.some(word => !matchedOriginalIndices.has(originalWords.indexOf(word))) && (
                                  <div className={resultsStyles.missingWords}>
                                    <span className={resultsStyles.missingLabel}>Missing words:</span>
                                    {originalWords.map((word, index) => {
                                      if (!matchedOriginalIndices.has(index)) {
                                        return (
                                          <span 
                                            key={`missing-${index}`}
                                            className={resultsStyles.wordMissing}
                                          >
                                            {word}
                                          </span>
                                        );
                                      }
                                      return null;
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          <em className={resultsStyles.emptyInput}>No input provided</em>
                        )}
                      </div>
                    </div>
                    
                    {/* Color legend for word-based analysis */}
                    <div className={resultsStyles.accuracyInfo}>
                      <div className={resultsStyles.accuracyItem}>
                        <div className={`${resultsStyles.accuracyColor} ${resultsStyles.accuracyCorrect}`}></div>
                        <span>Correct Word</span>
                      </div>
                      <div className={resultsStyles.accuracyItem}>
                        <div className={`${resultsStyles.accuracyColor} ${resultsStyles.accuracyPartial}`}></div>
                        <span>Partial Match</span>
                      </div>
                      <div className={resultsStyles.accuracyItem}>
                        <div className={`${resultsStyles.accuracyColor} ${resultsStyles.accuracyMissing}`}></div>
                        <span>Missing Word</span>
                      </div>
                      <div className={resultsStyles.accuracyItem}>
                        <div className={`${resultsStyles.accuracyColor} ${resultsStyles.accuracyExtra}`}></div>
                        <span>Extra Word</span>
                      </div>
                    </div>
                    
                    {/* Word-based accuracy breakdown */}
                    {appState.userInput && (
                      <div className={resultsStyles.accuracyStats}>
                        {(() => {
                          // Calculate word-based accuracy statistics
                          const originalWords = appState.originalSentence.split(' ');
                          const typedWords = appState.userInput.split(' ');
                          
                          let exactMatches = 0;
                          let partialMatches = 0;
                          let missingWords = 0;
                          let extraWords = 0;
                          
                          // Create a copy of typed words to track matches
                          const remainingTypedWords = [...typedWords];
                          
                          // Count exact matches and remove them
                          originalWords.forEach(originalWord => {
                            const index = remainingTypedWords.indexOf(originalWord);
                            if (index !== -1) {
                              exactMatches++;
                              remainingTypedWords.splice(index, 1);
                            } else {
                              missingWords++;
                            }
                          });
                          
                          // Remaining typed words are extra
                          extraWords = remainingTypedWords.length;
                          
                          const totalWords = originalWords.length + extraWords;
                          const wordAccuracy = totalWords > 0 
                            ? Math.round((exactMatches / totalWords) * 100) 
                            : 0;
                          
                          return (
                            <>
                              <div className={resultsStyles.accuracySummary}>
                                Word Accuracy: {wordAccuracy}% 
                                ({exactMatches} correct, {partialMatches} partial, {missingWords} missing, {extraWords} extra)
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={resultsStyles.buttonContainer}>
                  <button 
                    onClick={() => {
                      console.log('Try Again button clicked');
                      handleTryAgain(); // Use the new function that keeps the mode
                    }}
                    className={resultsStyles.primaryButton}
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => {
                      console.log('Change Mode button clicked');
                      handleChangeMode();
                    }}
                    className={resultsStyles.secondaryButton}
                  >
                    Change Mode
                  </button>
                </div>
              </div>
            ) : (
              <div className={resultsStyles.loadingContainer}>
                <div className={resultsStyles.loadingSpinner}></div>
                <p>Missing data for results: 
                  {!appState.startTime ? " [Start Time]" : ""}
                  {!appState.endTime ? " [End Time]" : ""}
                  {!appState.originalSentence ? " [Original Text]" : ""}
                  {!appState.userInput ? " [User Input]" : ""}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
