export interface BranchAdmin {
  id: string;
  email: string;
  branch: string;
  role: 'super_admin' | 'branch_admin';
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
}

export interface CreateBranchAdminData {
  email: string;
  branch: string;
  password: string;
  role: 'super_admin' | 'branch_admin';
}

export interface UpdateBranchAdminData {
  branch?: string;
  role?: 'super_admin' | 'branch_admin';
}
