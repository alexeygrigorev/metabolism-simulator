import { memo } from 'react';

interface SetEditorProps {
  exercise: any;
  sets: any[];
  onSetsChange: (sets: any[]) => void;
  onRemove: () => void;
}

const SetEditor = memo((props: SetEditorProps) => {
  const { exercise, sets, onSetsChange, onRemove } = props;

  return (
    <div className="test">
      <button onClick={onRemove}>Remove</button>
    </div>
  );
});

export default SetEditor;
