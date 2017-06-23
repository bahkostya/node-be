import actions   from './actions';
import contacts  from './contacts';
import sessions  from './sessions';
import users     from './users';
import news      from './news';
import images    from './images';

export default function routesInit() {
    return {
        actions,
        sessions,
        contacts,
        images,
        users,
        news
    };
}
