/**
 * Formats product description with emojis and structured sections
 * Parses description text and returns formatted JSX elements
 */

export const formatDescription = (description) => {
  if (!description) return null;

  // Split description by lines
  const lines = description.split('\n').filter(line => line.trim());
  
  const formattedSections = [];
  let currentSection = null;
  let currentItems = [];

  const processLine = (line, index) => {
    const trimmed = line.trim();
    
    // Check if line is a section header (ends with : or contains emoji patterns)
    const isHeader = /^[^:]+:/.test(trimmed) || 
                     /[\u{1F300}-\u{1F9FF}]/u.test(trimmed.split(':')[0]);
    
    // Check if line is a bullet point (starts with emoji, dash, or bullet)
    const isBullet = /^[\u{1F300}-\u{1F9FF}\-\u2022\u2713✅🚚💰🔄]/u.test(trimmed);
    
    if (isHeader && !isBullet) {
      // Save previous section if exists
      if (currentSection) {
        formattedSections.push({
          type: 'section',
          title: currentSection,
          items: [...currentItems]
        });
        currentItems = [];
      }
      currentSection = trimmed;
    } else if (isBullet || trimmed.startsWith('-') || trimmed.startsWith('•')) {
      currentItems.push(trimmed);
    } else if (trimmed) {
      // Regular paragraph text
      formattedSections.push({
        type: 'paragraph',
        content: trimmed
      });
    }
  };

  lines.forEach(processLine);

  // Don't forget the last section
  if (currentSection && currentItems.length > 0) {
    formattedSections.push({
      type: 'section',
      title: currentSection,
      items: [...currentItems]
    });
  }

  return formattedSections;
};

/**
 * Renders formatted description with proper styling
 */
export const renderFormattedDescription = (description) => {
  if (!description) return null;

  const sections = formatDescription(description);
  
  if (!sections || sections.length === 0) {
    return <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>;
  }

  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        if (section.type === 'paragraph') {
          return (
            <p 
              key={index} 
              className="text-gray-700 dark:text-gray-300 leading-relaxed text-base"
            >
              {section.content}
            </p>
          );
        }

        if (section.type === 'section') {
          return (
            <div key={index} className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {section.title}
              </h3>
              {section.items.length > 0 && (
                <ul className="space-y-2 ml-2">
                  {section.items.map((item, itemIndex) => (
                    <li 
                      key={itemIndex}
                      className="text-gray-700 dark:text-gray-300 leading-relaxed flex items-start gap-2"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
