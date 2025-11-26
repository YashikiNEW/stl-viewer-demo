import { useState, useCallback } from 'react'

/**
 * 表示設定のオプション
 */
interface UseDisplaySettingsOptions {
  /** 初期のモデル色 */
  initialColor?: string
  /** 初期のワイヤーフレーム状態 */
  initialWireframe?: boolean
}

/**
 * 表示設定のフックの戻り値
 */
interface UseDisplaySettingsReturn {
  /** 現在のモデル色 */
  modelColor: string
  /** ワイヤーフレーム表示状態 */
  wireframe: boolean
  /** モデル色を設定する */
  setModelColor: (color: string) => void
  /** ワイヤーフレーム状態を設定する */
  setWireframe: (enabled: boolean) => void
  /** ワイヤーフレーム状態をトグルする */
  toggleWireframe: () => void
  /** 設定を初期値にリセットする */
  resetSettings: () => void
}

/** デフォルトのモデル色（グレー） */
const DEFAULT_COLOR = '#808080'
/** デフォルトのワイヤーフレーム状態 */
const DEFAULT_WIREFRAME = false

/**
 * モデルの表示設定を管理するカスタムフック
 *
 * @param options 表示設定のオプション
 * @returns 表示設定の状態と操作関数
 *
 * @example
 * ```tsx
 * const { modelColor, wireframe, setModelColor, setWireframe } = useDisplaySettings()
 *
 * // 色を変更
 * setModelColor('#ff0000')
 *
 * // ワイヤーフレームをON
 * setWireframe(true)
 * ```
 */
export function useDisplaySettings(
  options: UseDisplaySettingsOptions = {}
): UseDisplaySettingsReturn {
  const {
    initialColor = DEFAULT_COLOR,
    initialWireframe = DEFAULT_WIREFRAME,
  } = options

  const [modelColor, setModelColorState] = useState(initialColor)
  const [wireframe, setWireframeState] = useState(initialWireframe)

  const setModelColor = useCallback((color: string) => {
    setModelColorState(color)
  }, [])

  const setWireframe = useCallback((enabled: boolean) => {
    setWireframeState(enabled)
  }, [])

  const toggleWireframe = useCallback(() => {
    setWireframeState((prev) => !prev)
  }, [])

  const resetSettings = useCallback(() => {
    setModelColorState(initialColor)
    setWireframeState(initialWireframe)
  }, [initialColor, initialWireframe])

  return {
    modelColor,
    wireframe,
    setModelColor,
    setWireframe,
    toggleWireframe,
    resetSettings,
  }
}
