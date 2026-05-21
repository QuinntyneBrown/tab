import { QueryResult } from '../common/query-result.interface';
import { Preferences } from './preferences.interface';
import { UpdatePreferencesRequest } from './update-preferences-request.interface';

export interface IPreferencesService {
  get(): QueryResult<Preferences>;
  update(request: UpdatePreferencesRequest): Promise<Preferences>;
}
