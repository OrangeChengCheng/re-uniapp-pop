
import utils from '@/utils/index'

declare global {
    interface Window {
        $service: {
            utils: string;
            commonTimeout: number;
            token: string;
            tokenId?: string;
        };
    }
}