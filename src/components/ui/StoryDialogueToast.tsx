import { useStoryStore } from '../../state/storyStore'

export function StoryDialogueToast() {
  const line = useStoryStore((s) => s.activeDialogueLine)

  if (!line) return null

  return (
    <aside className="story-dialogue-toast" role="status" aria-live="polite">
      <div className="story-dialogue-toast__bubble">
        <span className="story-dialogue-toast__emoji">{line.emoji}</span>
        <div className="story-dialogue-toast__content">
          <span className="story-dialogue-toast__speaker">{line.speakerName}</span>
          <p className="story-dialogue-toast__text">“{line.text}”</p>
        </div>
      </div>
    </aside>
  )
}
