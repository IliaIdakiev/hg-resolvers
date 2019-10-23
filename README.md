# AsyncRender

Are you sick of navigation blocking Angular resolver. No problem... just use the async-render component for the different parts of you app that need to be rendered 
and create directive resolvers that you can attach to the inidvidual async render components. You can also provide you cool loader to be visualized while loading
the data or you can use the exported `asyncRender` with a template variable to be able to check access the `isLoading` variable. You can also triggere refresh by using
the `refresh$.next()` subject method. For more info check out the [app](https://stackblitz.com/github/IliaIdakiev/async-render). Happy coding!