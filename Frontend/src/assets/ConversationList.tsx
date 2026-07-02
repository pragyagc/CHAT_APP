type Props = {
  conversations: any[];
  onSelect: (c: any) => void;
};

export default function ConversationList({ conversations, onSelect }: Props) {
  return (
    <div className="list">
      {conversations.map((c) => (
        <div key={c.id} onClick={() => onSelect(c)} className="item">
          {c.name}
        </div>
      ))}
    </div>
  );
}