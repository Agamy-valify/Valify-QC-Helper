export type UploadedFileContent = {
  name: string;
  type: string;
  size: number;
  text: string;
};

export type TestCaseRequest = {
  title: string;
  description: string;
  acceptanceCriteria: string;
  prerequisites?: string;
  additionalInfo?: string;
  deepAnalysis?: boolean;
  files?: UploadedFileContent[];
};

export type BugReportRequest = {
  whatHappened: string;
  deepAnalysis?: boolean;
  optionalFields?: {
    environment?: string;
    bugTypeCategory?: string;
    workaround?: string;
    preconditions?: string;
    affectedModule?: string;
    impactBusinessRisk?: string;
    reproducibility?: string;
    testData?: string;
    systemLogs?: string;
  };
  files?: UploadedFileContent[];
};
