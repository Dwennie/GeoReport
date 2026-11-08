/**
 * GeoReport domain types shared between Laravel Inertia responses and Vue pages.
 */

export type GeoRole = 'administrator' | 'staff' | 'citizen';

export type ComplaintStatus =
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'assigned'
    | 'in_progress'
    | 'resolved'
    | 'closed';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export type AttachmentKind = 'evidence' | 'resolution';

export type Category = {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon?: string;
    /** Hex colour used for map pins, chart series and category dots. */
    color: string;
    isActive: boolean;
    complaintCount: number;
};

export type Barangay = {
    id: number;
    name: string;
    district: string;
    psgcCode?: string | null;
    areaSqKm?: number | null;
    latitude?: number;
    longitude?: number;
    complaintCount?: number;
};

export type SharedCategoryItem = {
    id: number;
    name: string;
    slug: string;
    color: string;
    isActive: boolean;
};

export type SharedBarangayItem = {
    id: number;
    name: string;
    district: string;
};

export type SharedTaxonomy = {
    categories: SharedCategoryItem[];
    barangays: SharedBarangayItem[];
};

export type AssignedStaff = {
    id: number;
    name: string;
    department: string;
};

export type ComplaintAttachment = {
    id: number;
    kind: AttachmentKind;
    name: string;
    url: string;
};

export type ComplaintNote = {
    id: number;
    authorName: string;
    authorRole: GeoRole;
    body: string;
    isInternal: boolean;
    createdAt: string;
};

export type ComplaintStatusEvent = {
    id: number;
    status: ComplaintStatus;
    label: string;
    note?: string;
    actorName?: string;
    createdAt: string;
};

/** Row shape for tables and cards. */
export type ComplaintSummary = {
    id: number;
    reference: string;
    title: string;
    categoryId: number;
    category?: {
        id: number;
        name: string;
        color: string;
        slug: string;
    } | null;
    status: ComplaintStatus;
    priority: ComplaintPriority;
    barangay: string;
    address?: string;
    latitude: number;
    longitude: number;
    reporterName?: string;
    assignedStaffName?: string | null;
    createdAt?: string;
    submittedAt: string;
    updatedAt: string;
    assignedTo: AssignedStaff | null;
};

/** Full record for detail views. */
export type Complaint = ComplaintSummary & {
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    reporterId: number;
    reporterName: string;
    isPublic: boolean;
    resolvedAt: string | null;
    evidence: ComplaintAttachment[];
    resolutionEvidence: ComplaintAttachment[];
    notes: ComplaintNote[];
    timeline: ComplaintStatusEvent[];
};

export type StaffMember = {
    id: number;
    name: string;
    email: string;
    department: string;
    activeAssignments: number;
    resolvedCount: number;
};

export type ManagedUser = {
    id: number;
    name: string;
    email: string;
    role: GeoRole;
    barangay: string;
    status: 'active' | 'inactive';
    joinedAt: string;
};

export type AppNotification = {
    id: number;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
    complaintReference?: string;
};

export type ActivityEntry = {
    id: number;
    actor: string;
    action: string;
    target: string;
    createdAt: string;
};

export type NamedCount = {
    label: string;
    value: number;
};

export type TrendPoint = {
    label: string;
    submitted: number;
    resolved: number;
};

export type StatSummary = {
    label: string;
    value: number;
    hint?: string;
};

export type AssignmentRecord = {
    id: number;
    reference: string;
    title: string;
    staffId: number;
    staffName: string;
    assignedBy: string;
    assignedAt: string;
    status: ComplaintStatus;
};
