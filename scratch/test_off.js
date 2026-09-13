async function testOFF() {
  try {
    const res = await fetch(
      "https://world.openfoodfacts.org/api/v2/search?categories_tags_en=groceries&fields=code,product_name,brands,image_url,image_front_url,categories,ingredients_text,nutriscore_grade,quantity&page_size=10",
      {
        headers: {
          "User-Agent": "SmartPriceTagApp/1.0 (contact@smartpricetag.com)",
        },
      }
    );
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Found products:", data.count || data.products?.length);
    if (data.products && data.products.length > 0) {
      console.log("Sample product:", {
        code: data.products[0].code,
        name: data.products[0].product_name,
        brand: data.products[0].brands,
        image: data.products[0].image_front_url || data.products[0].image_url,
      });
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
testOFF();
