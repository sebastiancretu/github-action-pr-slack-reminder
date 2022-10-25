import { MessageAttachment } from '@slack/web-api';
import { MergeableType } from './pulls';

export interface TextSection {
  type: string;
  text: {
    type: string;
    text: string;
  };
}

export type PullRequestMappingType = {
  [key in MergeableType]: string;
};

export interface CustomMessageAttachment
  extends Omit<MessageAttachment, 'mrkdwn_in'> {
  mrkdwn_in?: ('pretext' | 'text' | 'fields' | 'footer')[];
}
