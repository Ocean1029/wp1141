// AI Service - handles diary segmentation and theme classification
// This is a simplified version using rule-based approach
// In production, this would integrate with actual AI models like OpenAI GPT or Claude

/**
 * Segment diary content into meaningful paragraphs
 * Uses simple heuristics to split text into logical segments
 * @param {string} content - The diary content to segment
 * @returns {Array<string>} Array of segmented paragraphs
 */
function segmentDiaryContent(content) {
  if (!content || typeof content !== 'string') {
    return [];
  }

  // Split by double line breaks first (natural paragraph breaks)
  let segments = content.split(/\n\s*\n+/);
  
  // Further split long paragraphs (>500 chars) by sentence boundaries
  segments = segments.flatMap(segment => {
    const trimmed = segment.trim();
    if (!trimmed) return [];
    
    // If segment is too long, try to split by sentences
    if (trimmed.length > 500) {
      // Split by sentence endings followed by space
      const sentences = trimmed.split(/([.!?]+\s+)/);
      const result = [];
      let currentSegment = '';
      
      for (let i = 0; i < sentences.length; i++) {
        currentSegment += sentences[i];
        
        // Check if we've accumulated enough content (200-600 chars is ideal)
        if (currentSegment.length >= 200 && /[.!?]/.test(currentSegment)) {
          result.push(currentSegment.trim());
          currentSegment = '';
        }
      }
      
      // Add any remaining content
      if (currentSegment.trim()) {
        result.push(currentSegment.trim());
      }
      
      return result.length > 0 ? result : [trimmed];
    }
    
    return [trimmed];
  });

  // Filter out empty segments and very short ones (< 20 chars)
  return segments.filter(seg => seg && seg.length >= 20);
}

/**
 * Classify segment into a theme based on keywords
 * This is a simplified rule-based classifier
 * In production, this would use ML models for better accuracy
 * @param {string} segmentContent - The content to classify
 * @param {Array<Object>} availableThemes - Available themes from database
 * @returns {string|null} Theme ID or null if no match
 */
function classifySegmentTheme(segmentContent, availableThemes) {
  if (!segmentContent || !availableThemes || availableThemes.length === 0) {
    return null;
  }

  const lowerContent = segmentContent.toLowerCase();

  // Define keyword patterns for different themes
  const themePatterns = {
    'procrastination': /\b(procrastinat|delay|postpone|put off|lazy|avoid|wait|later|tomorrow)\w*/gi,
    'self-worth': /\b(worth|value|worthless|useless|confidence|self-esteem|self-confidence|proud|ashamed|inadequate)\w*/gi,
    'relationships': /\b(friend|family|love|relationship|partner|spouse|boyfriend|girlfriend|parent|sibling|colleague|social|alone|lonely)\w*/gi,
    'anxiety': /\b(anxious|anxiety|worry|worried|stress|stressed|nervous|panic|fear|afraid|scared)\w*/gi,
    'motivation': /\b(motivat|inspire|goal|ambition|drive|purpose|passion|determined|discipline|focus)\w*/gi,
    'depression': /\b(depress|sad|sadness|melancholy|hopeless|despair|empty|numb|cry|crying|tears)\w*/gi,
    'work': /\b(work|job|career|project|task|deadline|meeting|boss|colleague|office|professional)\w*/gi,
    'health': /\b(health|sick|illness|doctor|hospital|medicine|exercise|fitness|diet|sleep|tired|fatigue)\w*/gi,
    'gratitude': /\b(grateful|gratitude|thankful|appreciate|appreciation|blessed|fortunate|lucky)\w*/gi,
    'reflection': /\b(reflect|reflection|realize|realization|understand|understanding|learn|learned|insight|perspective)\w*/gi,
  };

  // Score each theme based on keyword matches
  const scores = {};
  
  for (const theme of availableThemes) {
    const themeName = theme.name.toLowerCase();
    const pattern = themePatterns[themeName];
    
    if (pattern) {
      const matches = lowerContent.match(pattern);
      scores[theme.id] = matches ? matches.length : 0;
    } else {
      // Fallback: check if theme name appears in content
      const regex = new RegExp(`\\b${themeName}\\w*`, 'gi');
      const matches = lowerContent.match(regex);
      scores[theme.id] = matches ? matches.length : 0;
    }
  }

  // Find theme with highest score
  let maxScore = 0;
  let bestThemeId = null;

  for (const [themeId, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestThemeId = themeId;
    }
  }

  // Only return theme if we have at least 2 matches (to avoid false positives)
  return maxScore >= 2 ? bestThemeId : null;
}

/**
 * Process diary content: segment and classify
 * @param {string} content - Diary content
 * @param {Array<Object>} themes - Available themes
 * @returns {Array<Object>} Array of segments with theme assignments
 */
function processDiaryContent(content, themes) {
  const segments = segmentDiaryContent(content);
  
  return segments.map((segmentContent, index) => ({
    content: segmentContent,
    theme_id: classifySegmentTheme(segmentContent, themes),
    segment_order: index,
  }));
}

module.exports = {
  segmentDiaryContent,
  classifySegmentTheme,
  processDiaryContent,
};

