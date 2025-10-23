import EventsList from '../views/EventsList.vue'
import EventForm from '../views/EventForm.vue'
import EventDetail from '../views/EventDetail.vue'

export const routes = [
  {
    path: '/',
    redirect: '/events'
  },
  {
    path: '/events',
    name: 'EventsList',
    component: EventsList
  },
  {
    path: '/events/new',
    name: 'CreateEvent',
    component: EventForm
  },
  {
    path: '/events/:id',
    name: 'EventDetail',
    component: EventDetail,
    props: true
  },
  {
    path: '/events/:id/edit',
    name: 'EditEvent',
    component: EventForm,
    props: true
  }
]