import { AuthService } from './auth.service';

export function appInitializer(authService: AuthService): () => Promise<unknown> {
    return () => new Promise(resolve => {
        // attempt to refresh token on app start up to auto authenticate
        authService.refreshTokenWithTimer().then(resolve);
    });
}
