import { useCallback } from 'react'

interface DisplaySettingsProps {
  /** 現在のモデル色 */
  modelColor: string
  /** ワイヤーフレーム表示状態 */
  wireframe: boolean
  /** 色が変更された時のコールバック */
  onColorChange: (color: string) => void
  /** ワイヤーフレーム状態が変更された時のコールバック */
  onWireframeChange: (enabled: boolean) => void
}

/**
 * モデルの表示設定を変更するUIコンポーネント
 *
 * 機能:
 * - カラーピッカーでモデルの色を変更
 * - ワイヤーフレーム表示のON/OFF切り替え
 */
export function DisplaySettings({
  modelColor,
  wireframe,
  onColorChange,
  onWireframeChange,
}: DisplaySettingsProps) {
  const handleColorChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onColorChange(event.target.value)
    },
    [onColorChange]
  )

  const handleWireframeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onWireframeChange(event.target.checked)
    },
    [onWireframeChange]
  )

  return (
    <section
      role="region"
      aria-label="表示設定"
      style={{
        padding: '16px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
      }}
    >
      <h2 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>表示設定</h2>

      {/* カラーピッカー */}
      <div style={{ marginBottom: '12px' }}>
        <label
          htmlFor="model-color"
          style={{ display: 'block', color: '#666', marginBottom: '4px' }}
        >
          モデル色
        </label>
        <input
          id="model-color"
          type="color"
          value={modelColor}
          onChange={handleColorChange}
          style={{
            width: '100%',
            height: '32px',
            padding: '2px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        />
      </div>

      {/* ワイヤーフレームトグル */}
      <div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={wireframe}
            onChange={handleWireframeChange}
            style={{ marginRight: '8px' }}
          />
          <span>ワイヤーフレーム</span>
        </label>
      </div>
    </section>
  )
}
