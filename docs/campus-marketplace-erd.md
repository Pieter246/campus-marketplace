# Campus Marketplace - Mermaid ERD

```mermaid
erDiagram
    USER {
        string user_id PK
        string first_name
        string last_name
        string email
        string phone_number
        timestamp created_at
        timestamp updated_at
        boolean is_active
        boolean email_verified
    }
    
    USER_PROFILE {
        string profile_id PK
        string user_id FK
        string profile_picture_url
        string bio
        string preferred_contact_method
        string campus_location
        string student_number
        number year_of_study
        timestamp created_at
        timestamp updated_at
    }
    
    CATEGORY {
        string category_id PK
        string category_name
        string category_description
        boolean is_active
        timestamp created_at
    }
    
    ITEM {
        string item_id PK
        string seller_id FK
        string category_id FK
        string title
        string description
        number price
        string condition
        string item_status
        string collection_address
        string collection_instructions
        timestamp posted_at
        timestamp updated_at
        number views_count
    }
    
    ITEM_PHOTO {
        string photo_id PK
        string item_id FK
        string photo_url
        number photo_order
        timestamp uploaded_at
    }
    
    CART {
        string cart_id PK
        string buyer_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    CART_ITEM {
        string cart_item_id PK
        string cart_id FK
        string item_id FK
        number quantity
        timestamp added_at
    }
    
    ORDER {
        string order_id PK
        string buyer_id FK
        string seller_id FK
        string order_status
        number order_total
        number delivery_cost
        string collection_address
        string collection_instructions
        timestamp order_date
        timestamp completion_date
        string notes
    }
    
    ORDER_ITEM {
        string order_item_id PK
        string order_id FK
        string item_id FK
        number quantity
        number price_at_purchase
        number item_total
    }
    
    PAYMENT {
        string payment_id PK
        string order_id FK
        string payment_method
        string payment_status
        number payment_amount
        string transaction_reference
        timestamp payment_date
        object gateway_response
    }
    
    MESSAGE {
        string message_id PK
        string sender_id FK
        string receiver_id FK
        string item_id FK
        string subject
        string message_content
        timestamp sent_at
        timestamp read_at
        string message_type
    }

    %% Relationships
    USER ||--|| USER_PROFILE : "has"
    USER ||--|| CART : "owns"
    USER ||--o{ ITEM : "sells"
    USER ||--o{ ORDER : "buys"
    USER ||--o{ ORDER : "sells_to"
    USER ||--o{ MESSAGE : "sends"
    USER ||--o{ MESSAGE : "receives"
    
    CATEGORY ||--o{ ITEM : "contains"
    
    ITEM ||--o{ ITEM_PHOTO : "has_photos"
    ITEM ||--o{ CART_ITEM : "in_cart"
    ITEM ||--o{ ORDER_ITEM : "in_order"
    ITEM ||--o{ MESSAGE : "about"
    
    CART ||--o{ CART_ITEM : "contains"
    
    ORDER ||--o{ ORDER_ITEM : "includes"
    ORDER ||--o{ PAYMENT : "paid_by"
```