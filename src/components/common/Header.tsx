import './Header.css'

interface HeaderProps {
  title?: string
}

export function Header({ title = 'STL 3D Viewer' }: HeaderProps) {
  return (
    <header className="header" data-testid="header">
      <h1 className="header__title">{title}</h1>
      <div className="header__actions">
        {/* アップロードボタンや比較ボタンは後続Issueで実装 */}
      </div>
    </header>
  )
}
