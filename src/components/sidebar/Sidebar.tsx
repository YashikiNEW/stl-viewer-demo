import './Sidebar.css'

interface SidebarProps {
  children?: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="sidebar" data-testid="sidebar">
      {children || (
        <div className="sidebar__placeholder">
          サイドパネル（後続Issueで実装）
        </div>
      )}
    </aside>
  )
}
