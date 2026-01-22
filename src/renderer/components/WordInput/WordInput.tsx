import React, { useState } from 'react';
import { useStore } from '../../store';
import Button from '../common/Button';
import './WordInput.css';

const WordInput: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const { words, setWords } = useStore();

  const handleParse = () => {
    // Parse words by newlines and commas
    const parsed = inputText
      .split(/[\n,]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    setWords(parsed);
  };

  const handleClear = () => {
    setInputText('');
    setWords([]);
  };

  return (
    <div className="word-input">
      <h2>Input Words</h2>
      <p className="description">
        Enter English words to generate flashcards. Separate words by new lines or commas.
      </p>

      <div className="form-group">
        <label htmlFor="word-textarea">Word List</label>
        <textarea
          id="word-textarea"
          className="word-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Example:&#10;hello&#10;world&#10;computer&#10;&#10;Or: hello, world, computer"
          rows={12}
        />
      </div>

      <div className="button-group">
        <Button onClick={handleParse}>Parse Words</Button>
        <Button onClick={handleClear} variant="secondary">
          Clear
        </Button>
      </div>

      {words.length > 0 && (
        <div className="word-list">
          <h3>Parsed Words ({words.length})</h3>
          <div className="word-chips">
            {words.map((word, index) => (
              <span key={index} className="word-chip">
                {word}
                <button
                  className="remove-word"
                  onClick={() => {
                    const newWords = words.filter((_, i) => i !== index);
                    setWords(newWords);
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WordInput;
