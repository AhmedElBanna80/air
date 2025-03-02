import { createContainer } from 'di-wise';
import { registerRepositories } from './repositories';
import { registerServices } from './services';

const rootContainer = createContainer()
registerServices(rootContainer)
registerRepositories(rootContainer)

export { rootContainer };
