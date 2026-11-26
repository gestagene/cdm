interface Media {
  media_url: string;
  storage_path: string;
  uploaded_at: string;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  description: string;
  category: Category;
  condition: Condition;
  media?: Media[];
  status?: Status;
}

export type Condition = "New" | "Like New" | "Good" | "Fair";
export type Category =
  | "All"
  | "Uniforms"
  | "Books"
  | "Supplies"
  | "Merch"
  | "Electronics"
  | "Arts"
  | "Essentials"
  | "Others";
export type Status = "Available" | "Sold" | "Archived";
