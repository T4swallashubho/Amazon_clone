# Amazona Website.


# Lessons

1. Installed tools on windows
2. Configuring VS Code
3. Create React app
4. Created a Git Repository
5. List Products
   1. create products array
   2. add product images
   3. render products
   4. style products

6. Add page routing
   1. npm i react-router-dom
   2. create route for home screen
   3. create router for product screen

7. Create Node.JS Server
   1. run npm init in root folder
   2. Update package.json set type: module
   3. Add .js to imports
   4. npm install express
   5. create server.js
   6. add start command as node backend/server.js
   7. require express
   8. create route for / return backend is ready.
   9. move products.js from frontend to backend
   10. create route for /api/products
   11. return products
   12. run npm start

8. Fetch Products From Backend
   1. set proxy in package.json
   2. npm install axios
   3. use state hook
   4. use effect hook
   5. use reducer hook

9. Manage State By Reducer Hook
   1. define reducer
   2. update fetch data
   3. get state from usReducer


10. Add bootstrap UI Framework
   1. npm install react-bootstrap bootstrap
   2. update App.js


11. Create Product and Rating Component
   1. create Rating component
   2. Create Product component
   3. Use Rating component in Product component


12. Create Product Details Screen
   1. fetch product from backend
   2. create 3 columns for image, info and action


13. Create Loading and Message Component
   1. create loading component
   2. use spinner component
   3. create message component
   4. create utils.js to define getError fuction

14. Create React Context For Add Item To Cart
   1. Create React Context
   2. define reducer
   3. create store provider
   4. implement add to cart button click handler

15. Complete Add To Cart
   1. check exist item in the cart
   2. check count in stock in backend


16. Create Cart Screen
   1. create 2 columns
   2. display items list
   3. create action column


17. Complete Cart Screen
   1. click handler for inc/dec item
   2. click handler for remove item
   3. click handler for checkout

18. Create Signin Screen
   1. Add to Cart functionality on Product.js page (From 17)
   2. create sign in form
   3. add email and password
   4. add signin button

19. Connect To MongoDB Database
   1. create atlas monogodb database
   2. install local mongodb database
   3. npm install mongoose
   4. connect to mongodb database


20. Seed Sample Products
   1. create Product model
   2. create seed route
   3. use route in server.js
   4. seed sample product

21. Seed Sample Users
    1. create user model
    2. seed sample users

22. Create Signin Backend API
    1. create signin api
    2. npm install jsonwebtoken
    3. define generateToken


23. Complete Signin Screen
    1. handle submit action
    2. save token in store and local storage
    3. show user name in header

24. Create Shipping Screen
    1. create form inputs
    2. handle save shipping address
    3. add checkout wizard bar

25. Create Sign Up Screen
    1. create input forms
    2. handle submit
    3. create backend api

26. Implement Select Payment Method Screen
    1. create input forms
    2. handle submit


27. Create Place Order Screen
    1. show cart items, payment and address
    2. handle place order action
    3. create order create api

28. Implement Place Order Action
    1. handle place order action
    2. create order create api

29. Create Order Screen
    1. create backend api for order/:id
    2. fetch order api in frontend
    3. show order information in 2 columns


30. Customer-Area Display Order History
    1. create order screen
    2. create order history api
    3. use api in the frontend


31. Create Profile Screen
    1. get user info from context
    2. show user information
    3. create user update api
    4. update user info


32. Add Sidebar and Search Box
    1. add sidebar
    2. add search box

33. Create Search Screen
    1. show filters
    2. create api for searching products
    3. display results


34. Create Admin Menu
    1. define protected route component
    2. define admin route component
    3. add menu for admin in header


35. Create Dashboard Screen
    1. create dashboard ui
    2. implement backend api
    3. connect ui to backend


36. Manage Products
    1. create products list ui
    2. implement backend api
    3. fetch data

37. Create Product
    1. create products button
    2. implement backend api
    3. handle on click

38. Create Edit Product
    1. create edit button
    2. create edit product ui
    3. dispaly product info in the input boxes

39. Implement Update Product
    1. create edit product backend api
    2. handle update click


40. Upload Product Image
    1. create cloudinary account
    2. use the api key in env file
    3. handle upload file
    4. implement backend api to upload


41. Delete Product
    1. show delete button
    2. implement backend api
    3. handle on click

42. List Orders
    1. create order list screen
    2. implement backen api
    3. fetch and display orders

43. List Users & Checkout Pay Enhancement & rectified an error of including message component
    1. create user list screen
    2. implement backen api
    3. fetch and display users


44. Deliver Order & Checkout Pay Enhancement (Payment Improved)-Second Commit
    1. add deliver button
    2. handle click action
    3. implement backen api for deliver

45. Little Enhancement on Checkout Screen (Some Code CleanUp)

46. Delete Order
    1. add delete button
    2. handle click action
    3. implement backen api for delete


47. Edit User
    1. create edit button
    2. create edit product ui
    3. dispaly product info in the input boxes
    4. implement backend api
    5. handle edit click


48. Delete User
    1. add delete button
    2. handle click action
    3. implement backen api for delete



49. Choose Address On Google Map
    1. create google map credentials
    2. update .env file with Google Api Key
    3. create api to send google api to frontend
    4. create map screen
    5. fetch google api
    6. getUserLocation
    7. install @react-google-maps/api
    8. use it in shipping screen
    9. apply map to the checkout screen

50. Quick Google Map fix


51. Review Orders
    1. create submit review form
    2. handle submit
    3. implement backend api for review

52. Upload multiple Images
    1. add images to product model
    2. get images in edit screen
    3. show images in product screen


53. Updated isSeller field in the User model.


54. Implement Seller View
    1. add seller menu
    2. create seller route
    3. list products for seller
    4. list orders for seller
    5. add Seller to Product List and Details Screen


55. Quick order's seller update fix

56. Create Seller Page
    1. create seller page
    2. update product component and product screen
    3. update product routes


57. Add Top Seller Carousel
    1. install react carousel
    2. implement actions and reducers for top sellers
    3. use react carousel with data in Home Screen


58. Force Order Items From One Seller
    1.  update addToCart action to buy from one seller at an order


59. Image for home screen display

60. Implement React Paginate for homescreen and product page

61. Little change to the code (Displaying top brands)

62. Implement Live Chat With Customers
     1.  use socket io to create backend
     2.  create chat box component
     3.  create support screen