import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type StaffRole = 'CS' | 'L1' | 'L2' | 'L3';

export interface StaffInfo {
    id: string;
    name: string;
    role: StaffRole;
}

interface StaffAuthContextType {
    staff: StaffInfo | null;
    isAuthenticated: boolean;
    login: (staff: StaffInfo) => void;
    logout: () => void;
    canSubstituteAuth: boolean; // L1+ 才能代认证
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

const STORAGE_KEY = 'staff_auth';

export const StaffAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [staff, setStaff] = useState<StaffInfo | null>(null);

    // 从 localStorage 恢复登录状态
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as StaffInfo;
                setStaff(parsed);
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    const login = (staffInfo: StaffInfo) => {
        setStaff(staffInfo);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(staffInfo));
    };

    const logout = () => {
        setStaff(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const canSubstituteAuth = staff?.role === 'L1' || staff?.role === 'L2' || staff?.role === 'L3';

    return (
        <StaffAuthContext.Provider value={{
            staff,
            isAuthenticated: !!staff,
            login,
            logout,
            canSubstituteAuth
        }}>
            {children}
        </StaffAuthContext.Provider>
    );
};

export const useStaffAuth = (): StaffAuthContextType => {
    const context = useContext(StaffAuthContext);
    if (!context) {
        throw new Error('useStaffAuth must be used within StaffAuthProvider');
    }
    return context;
};

// 角色显示名称
export const getRoleDisplayName = (role: StaffRole): string => {
    switch (role) {
        case 'CS': return '客服专员';
        case 'L1': return '一级管理员';
        case 'L2': return '二级管理员';
        case 'L3': return '三级管理员';
        default: return role;
    }
};

// 角色权限描述
export const getRolePermissions = (role: StaffRole): string[] => {
    switch (role) {
        case 'CS':
            return ['查询核保记录', '重发验证码', '查看客户信息'];
        case 'L1':
            return ['查询核保记录', '重发验证码', '代完成认证', '代补充材料'];
        case 'L2':
            return ['查询核保记录', '重发验证码', '代完成认证', '代补充材料', '代提理赔'];
        case 'L3':
            return ['查询核保记录', '重发验证码', '代完成认证', '代补充材料', '代提理赔', '代支付/退保'];
        default:
            return [];
    }
};
