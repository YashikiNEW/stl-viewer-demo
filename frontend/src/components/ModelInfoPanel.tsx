import type { ModelInfo } from '../types/model'

interface ModelInfoPanelProps {
  modelInfo: ModelInfo | null | undefined
}

/**
 * 数値をカンマ区切りでフォーマット
 */
function formatNumber(value: number): string {
  return value.toLocaleString('ja-JP')
}

/**
 * 小数値を2桁でフォーマット
 */
function formatDecimal(value: number): string {
  return value.toFixed(2)
}

/**
 * モデル情報を表示するパネルコンポーネント
 */
export function ModelInfoPanel({ modelInfo }: ModelInfoPanelProps) {
  if (!modelInfo) {
    return (
      <section
        role="region"
        aria-label="モデル情報"
        style={{
          padding: '16px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}
      >
        <h2 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>モデル情報</h2>
        <p style={{ color: '#666', margin: 0 }}>モデルが読み込まれていません</p>
      </section>
    )
  }

  return (
    <section
      role="region"
      aria-label="モデル情報"
      style={{
        padding: '16px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}
    >
      <h2 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>モデル情報</h2>

      <div style={{ marginBottom: '8px' }}>
        <span style={{ color: '#666' }}>頂点数: </span>
        <span style={{ fontWeight: 'bold' }}>{formatNumber(modelInfo.vertexCount)}</span>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <span style={{ color: '#666' }}>面数: </span>
        <span style={{ fontWeight: 'bold' }}>{formatNumber(modelInfo.faceCount)}</span>
      </div>

      <div>
        <div style={{ color: '#666', marginBottom: '4px' }}>サイズ:</div>
        <div style={{ paddingLeft: '12px' }}>
          <div>X: {formatDecimal(modelInfo.boundingBox.x)}</div>
          <div>Y: {formatDecimal(modelInfo.boundingBox.y)}</div>
          <div>Z: {formatDecimal(modelInfo.boundingBox.z)}</div>
        </div>
      </div>
    </section>
  )
}
