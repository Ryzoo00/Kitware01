import { renderFormattedDescription } from '../../utils/formatDescription.jsx';

/**
 * Description Preview Component for Admin Panel
 * Shows a live preview of how the product description will appear
 */
const DescriptionPreview = ({ description }) => {
  if (!description || description.trim() === '') {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Start typing to see preview...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
        <span className="text-lg">👁️</span>
        Preview
      </h3>
      <div className="prose dark:prose-invert max-w-none">
        {renderFormattedDescription(description)}
      </div>
    </div>
  );
};

export default DescriptionPreview;
