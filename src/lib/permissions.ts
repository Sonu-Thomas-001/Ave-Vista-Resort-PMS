export type UserRole = 'Admin' | 'Manager' | 'Reception';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    Admin: ['*'], // Full access
    Manager: [
        '/',
        '/bookings',
        '/rooms',
        '/guests',
        '/reports',
        '/help',
        '/profile'
    ],
    Reception: [
        '/',
        '/bookings',
        '/rooms',
        '/guests',
        '/front-desk',
        '/billing',
        '/help',
        '/profile'
    ]
};

export const hasAccess = (role: UserRole | undefined, path: string): boolean => {
    if (!role) return false;
    const permissions = ROLE_PERMISSIONS[role];
    if (!permissions) return false;

    if (permissions.includes('*')) return true;

    // Direct match or sub-path match (e.g., /bookings/new)
    return permissions.some(p => path === p || path.startsWith(`${p}/`));
};
