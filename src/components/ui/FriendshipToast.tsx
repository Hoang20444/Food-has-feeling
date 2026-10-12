import { friendshipState, useFriendshipState } from '../../state/friendshipState'
import { storyStore, useStoryStore } from '../../state/storyStore'

export function FriendshipToast() {
  const discovery = useFriendshipState((s) => s.recentDiscovery)
  const newPostcard = useStoryStore((s) => s.newlyUnlockedPostcard)

  if (!discovery && !newPostcard) return null

  if (newPostcard) {
    return (
      <div className="friendship-toast" role="status" aria-live="polite">
        <div className="friendship-toast__card is-postcard">
          <span className="friendship-toast__emoji">{newPostcard.stampEmoji}</span>
          <div className="friendship-toast__body">
            <div className="friendship-toast__header">
              <span className="friendship-toast__badge">💌 New Postcard Story</span>
              <strong className="friendship-toast__title">{newPostcard.title}</strong>
            </div>
            <p className="friendship-toast__note">“{newPostcard.message}”</p>
          </div>
          <button
            type="button"
            className="friendship-toast__album-btn"
            onClick={() => storyStore.openAlbum()}
            title="Open memory album"
          >
            Open Album
          </button>
          <button
            type="button"
            className="friendship-toast__close"
            onClick={() => storyStore.dismissUnlockedToast()}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  if (!discovery) return null

  return (
    <div className="friendship-toast" role="status" aria-live="polite">
      <div className="friendship-toast__card">
        <span className="friendship-toast__emoji">{discovery.emoji}</span>
        <div className="friendship-toast__body">
          <div className="friendship-toast__header">
            <span className="friendship-toast__badge">✨ Moment Discovered</span>
            <strong className="friendship-toast__title">{discovery.title}</strong>
          </div>
          <p className="friendship-toast__note">{discovery.note}</p>
        </div>
        <button
          type="button"
          className="friendship-toast__close"
          onClick={() => friendshipState.dismissDiscovery()}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
