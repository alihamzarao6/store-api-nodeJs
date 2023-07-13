const Product = require("../models/product");

const getAllProductsStatic = async (req, res) => {
  try {
    const products = await Product.find({}).sort("-name price");
    res.status(200).json({ products, nbHits: products.length });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    // Now if our query have even so many options(key-value) but we'll get those which we defined in our DB or Schema
    // And then we'll find products according to our defined options
    const { featured, company, name, sort, fields, numericFilters } = req.query;
    const queryObject = {};

    if (featured) {
      // setup a 'featured' property for queryObject
      queryObject.featured = featured === "true" ? true : false;
    }

    if (company) {
      queryObject.company = company;
    }

    if (name) {
      queryObject.name = { $regex: name, $options: "i" };
    }

    if (numericFilters) {
      const operatorMap = {
        ">": "$gt",
        ">=": "$gte",
        "=": "$eq",
        "<": "$lt",
        "<=": "$lte",
      };

      const regEx = /\b(<|>|>=|=|<|<=)\b/g; // regex will contain all comparison operators(>,<, >=, =, <=)

      // if numericFilters= 'price>=30' then '>=' is converted into '-$gte-' using ' replace(regEx, (match) => `-${operatorsMap[match]}-`) ' because '>=' is following the pattern of 'regEx' and we'll returned with 'price-$gte-30' via 'filters' variable.
      let filters = numericFilters.replace(
        regEx,
        (match) => `-${operatorMap[match]}-`
      );

      // options which will be available for filtering
      const options = ["price", "rating"];

      /* Now if we have two numericFilters 'price>=30,rating<4' which are converted into 'price-$gte-30,rating-$lt-4' 
      filter. Now we will split out returned filter into 'price-$gte-30' and 'rating-$lt-4'. Then we are spliting each 
      item with '-' and for each item we are doing destructring to extract field, operator and value which is 'price, 
      $gte and 30' in case of first filter item and 'rating, $lt and 4' in second item case. Then we'll compare if
      options array includes the 'field'(extracted from item). If it includes then we'll create a new sub object in
      queryObject. In this case we will create a sub-object in `queryObject` with the key `'price'`, the value `{ '$gte':
      10 }` and then of course we will get products based on this filter in the end. */
      filters = filters.split(",").forEach((item) => {
        const [field, operator, value] = item.split("-");
        if (options.includes(field)) {
          queryObject[field] = { [operator]: Number(value) };
        }
      });
    }

    let result = Product.find(queryObject);

    // sort
    if (sort) {
      const sortList = sort.split(",").join(" ");
      result = result.sort(sortList);
    } else {
      result = result.sort("createdAt");
    }

    // select
    if (fields) {
      const fieldsList = fields.split(",").join(" ");
      result = result.select(fieldsList);
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    result = result.skip(skip).limit(limit);

    let products = await result;

    res.status(200).json({ products, nbHits: products.length });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = { getAllProductsStatic, getAllProducts };
