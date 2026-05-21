import { QueryResult } from '../common/query-result.interface';
import { ShareLink } from './share-link.interface';
import { ShareLinkRequest } from './share-link-request.interface';
import { Statement } from './statement.interface';
import { StatementQuery } from './statement-query.interface';

export interface IStatementService {
  get(query?: StatementQuery): QueryResult<Statement>;
  share(request: ShareLinkRequest): Promise<ShareLink>;
  getShared(token: string): QueryResult<Statement>;
}
