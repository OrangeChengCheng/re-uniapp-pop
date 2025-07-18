/*
 * @Author: Lemon C
 * @Date: 2025-07-18 09:52:06
 * @LastEditTime: 2025-07-18 10:17:07
 */
// loading.ts
import { ElLoading, LoadingOptions } from 'element-plus';

// 使用 ReturnType 自动推导实例类型
type LoadingInstance = ReturnType<typeof ElLoading.service>;

let loadingInstance: LoadingInstance | null = null;

/**
 * 显示加载动画
 * @param options - 加载动画配置项
 */
export function showLoading(options?: Partial<LoadingOptions>): void {
    const defaultOptions: LoadingOptions = {
        lock: true,
        background: 'rgba(0, 0, 0, 0.5)',
        text: '',
    };

    hideLoading();

    loadingInstance = ElLoading.service({
        ...defaultOptions,
        ...options
    });
}

/**
 * 隐藏加载动画
 */
export function hideLoading(): void {
    if (loadingInstance) {
        loadingInstance.close();
        loadingInstance = null;
    }
}