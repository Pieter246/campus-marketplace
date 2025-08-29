# LOGICAL ERD SPECIFICATION
## Campus Marketplace - Database Design

### ENTITIES AND ATTRIBUTES

#### USER
- **user_id** (PK)
- first_name
- last_name
- email
- phone_number
- created_at
- updated_at
- is_active
- email_verified

#### USER_PROFILE
- **profile_id** (PK)
- user_id (FK) → USER.user_id
- profile_picture_url
- bio
- preferred_contact_method
- campus_location
- student_number
- year_of_study
- created_at
- updated_at

#### CATEGORY
- **category_id** (PK)
- category_name
- category_description
- is_active
- created_at

#### ITEM
- **item_id** (PK)
- seller_id (FK) → USER.user_id
- category_id (FK) → CATEGORY.category_id
- title
- description
- price
- condition
- item_status
- collection_address
- collection_instructions
- posted_at
- updated_at
- views_count

#### ITEM_PHOTO
- **photo_id** (PK)
- item_id (FK) → ITEM.item_id
- photo_url
- photo_order
- uploaded_at

#### CART
- **cart_id** (PK)
- buyer_id (FK) → USER.user_id
- created_at
- updated_at

#### CART_ITEM
- **cart_item_id** (PK)
- cart_id (FK) → CART.cart_id
- item_id (FK) → ITEM.item_id
- quantity
- added_at

#### ORDER
- **order_id** (PK)
- buyer_id (FK) → USER.user_id
- seller_id (FK) → USER.user_id
- order_status
- order_total
- delivery_cost
- collection_address
- collection_instructions
- order_date
- completion_date
- notes

#### ORDER_ITEM
- **order_item_id** (PK)
- order_id (FK) → ORDER.order_id
- item_id (FK) → ITEM.item_id
- quantity
- price_at_purchase
- item_total

#### PAYMENT
- **payment_id** (PK)
- order_id (FK) → ORDER.order_id
- payment_method
- payment_status
- payment_amount
- transaction_reference
- payment_date
- gateway_response

#### MESSAGE
- **message_id** (PK)
- sender_id (FK) → USER.user_id
- receiver_id (FK) → USER.user_id
- item_id (FK) → ITEM.item_id (OPTIONAL)
- subject
- message_content
- sent_at
- read_at
- message_type

---

### RELATIONSHIPS

#### One-to-One (1:1)
- USER ←→ USER_PROFILE
- USER ←→ CART

#### One-to-Many (1:M)
- USER (seller) → ITEM
- USER (buyer) → ORDER
- USER (seller) → ORDER
- USER (sender) → MESSAGE
- USER (receiver) → MESSAGE
- CATEGORY → ITEM
- ITEM → ITEM_PHOTO
- ITEM → CART_ITEM
- ITEM → ORDER_ITEM
- CART → CART_ITEM
- ORDER → ORDER_ITEM
- ORDER → PAYMENT

#### Many-to-Many (M:M) - Resolved with Junction Tables
- USER ←→ ITEM (via CART_ITEM)
- ORDER ←→ ITEM (via ORDER_ITEM)

---

### BUSINESS RULES

1. **User Rules:**
   - Each user must have a unique email address
   - Users can be both buyers and sellers
   - Each user has exactly one profile and one cart

2. **Item Rules:**
   - Items must belong to exactly one category
   - Items must have a seller (user)
   - Items can have multiple photos

3. **Cart Rules:**
   - Each user has exactly one cart
   - Cart can contain multiple items
   - Same item can appear only once per cart (use quantity)

4. **Order Rules:**
   - Orders must have both buyer and seller
   - Orders can contain multiple items
   - Orders require at least one payment

5. **Message Rules:**
   - Messages can be item-specific or general
   - Messages must have sender and receiver
   - Users cannot message themselves

6. **Payment Rules:**
   - Each payment belongs to exactly one order
   - Orders can have multiple payment attempts

---

### CONSTRAINTS

#### Primary Keys
- All entities have auto-incrementing primary keys

#### Foreign Keys
- All foreign key relationships are enforced
- CASCADE DELETE for dependent entities
- RESTRICT DELETE for referenced entities

#### Unique Constraints
- USER.email (unique)
- CATEGORY.category_name (unique)
- CART.buyer_id (unique - one cart per user)

#### Check Constraints
- ITEM.price > 0
- ORDER_ITEM.quantity > 0
- PAYMENT.payment_amount > 0
- USER.year_of_study BETWEEN 1 AND 10

---

### INDEXES (for performance)

#### Primary Indexes (automatic)
- All primary keys are automatically indexed

#### Secondary Indexes
- USER.email
- ITEM.seller_id
- ITEM.category_id
- ITEM.item_status
- ORDER.buyer_id
- ORDER.seller_id
- MESSAGE.sender_id
- MESSAGE.receiver_id

#### Composite Indexes
- ITEM (category_id, item_status, posted_at)
- CART_ITEM (cart_id, added_at)
- MESSAGE (receiver_id, read_at, sent_at)
