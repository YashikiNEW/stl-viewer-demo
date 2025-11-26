import { useCallback } from 'react'
import type { CompareModelData } from '../types/compare'
import { StlUpload } from './StlUpload'

interface CompareModeProps {
  /** 比較モードがONかどうか */
  isCompareMode: boolean
  /** 比較モードの切り替えコールバック */
  onToggleCompare: () => void
  /** 左側のモデル */
  leftModel: CompareModelData | null
  /** 右側のモデル */
  rightModel: CompareModelData | null
  /** 左側モデルが読み込まれた時のコールバック */
  onLeftModelLoad: (file: File, data: ArrayBuffer | string) => void
  /** 右側モデルが読み込まれた時のコールバック */
  onRightModelLoad: (file: File, data: ArrayBuffer | string) => void
}

/**
 * 比較モードのUIコンポーネント
 *
 * 機能:
 * - 比較モード切り替えボタン
 * - 左右分割レイアウト（比較モード時）
 * - 左右それぞれのファイルアップロードエリア
 */
export function CompareMode({
  isCompareMode,
  onToggleCompare,
  leftModel,
  rightModel,
  onLeftModelLoad,
  onRightModelLoad,
}: CompareModeProps) {
  const handleLeftFileLoad = useCallback(
    (file: File, data: ArrayBuffer | string) => {
      onLeftModelLoad(file, data)
    },
    [onLeftModelLoad]
  )

  const handleRightFileLoad = useCallback(
    (file: File, data: ArrayBuffer | string) => {
      onRightModelLoad(file, data)
    },
    [onRightModelLoad]
  )

  return (
    <div>
      {/* 比較モード切り替えボタン */}
      <button
        type="button"
        onClick={onToggleCompare}
        style={{
          padding: '8px 16px',
          marginBottom: '16px',
          backgroundColor: isCompareMode ? '#e74c3c' : '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {isCompareMode ? '比較終了' : '比較モード'}
      </button>

      {/* 比較モード時の左右分割レイアウト */}
      {isCompareMode && (
        <div
          data-testid="compare-container"
          style={{
            display: 'flex',
            gap: '16px',
            width: '100%',
          }}
        >
          {/* 左側パネル */}
          <div
            data-testid="left-panel"
            style={{
              flex: 1,
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#f9f9f9',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0' }}>モデル 1</h3>
            <div data-testid="left-upload">
              <StlUpload onFileLoad={handleLeftFileLoad} />
            </div>
            {leftModel && (
              <div style={{ marginTop: '16px', color: '#27ae60' }}>
                読み込み済み: {leftModel.file.name}
              </div>
            )}
          </div>

          {/* 右側パネル */}
          <div
            data-testid="right-panel"
            style={{
              flex: 1,
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#f9f9f9',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0' }}>モデル 2</h3>
            <div data-testid="right-upload">
              <StlUpload onFileLoad={handleRightFileLoad} />
            </div>
            {rightModel && (
              <div style={{ marginTop: '16px', color: '#27ae60' }}>
                読み込み済み: {rightModel.file.name}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
