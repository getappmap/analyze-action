type ImpactDomain = 'Security' | 'Performance' | 'Maintainability' | 'Stability';

// TODO: add Event type instead of using any
export type Finding = {
  appMapFile: string;
  checkId: string;
  ruleId: string;
  ruleTitle: string;
  event: any;
  hash: string; // Deprecated for local use. Still used to integrate local results with the server.
  hash_v2: string;
  scope: any;
  message: string;
  stack: string[];
  groupMessage?: string;
  occurranceCount?: number;
  relatedEvents?: any[];
  impactDomain?: ImpactDomain;
  // Map of events by functional role name; for example, logEvent, secret, scope, etc.
  participatingEvents?: Record<string, any>;
  scopeModifiedDate?: Date;
  eventsModifiedDate?: Date;
};
