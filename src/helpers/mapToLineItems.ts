import { ShoppingCartReplaceItem_checkoutLineItemsReplace_checkout_lineItems as CartReplaceLineItems } from '../generated/server/ShoppingCartReplaceItem';
import { ShoppingCartCreate_checkoutCreate_checkout_lineItems as CartCreateLineItems } from '../generated/server/ShoppingCartCreate';
import { GetOrderHistory_customer_orders_edges_node_lineItems as OrderHistoryLineItems } from '../generated/server/GetOrderHistory';
import { LineItem } from '../types/types';

type CompatibleType =
  | CartReplaceLineItems
  | CartCreateLineItems
  | OrderHistoryLineItems;

// the code below this is like that because somehow the CartCreateLineItems edges not detected
type MyEdges = CompatibleType['edges'];
type MyEdge = MyEdges[0] | CartCreateLineItems['edges'][0];

function getEdges(i: CompatibleType): Array<MyEdge> {
  return i.edges;
}

export function mapToLineItems(lineItems: CompatibleType): Array<LineItem> {
  return getEdges(lineItems).map(
    ({ node }): LineItem => {
      let { quantity, discountAllocations, title, variant } = node;
      let image = '';
      let priceAfterDiscount = 0;
      let originalPrice = 0;
      let variantID = '';
      let variants = '';
      if (variant) {
        let { compareAtPriceV2, priceV2, id, selectedOptions } = variant;
        variantID = id;
        let allVariant = selectedOptions.map(
          ({ name, value }) => `${name} ${value}`,
        );
        variants = allVariant.join(', ');
        if (variant.image) {
          image = variant.image.transformedSrc;
          if (discountAllocations.length === 0) {
            priceAfterDiscount = compareAtPriceV2 ? Number(priceV2.amount) : 0;
          } else {
            priceAfterDiscount = Number(
              discountAllocations[0].allocatedAmount.amount,
            );
          }
        }
        if (compareAtPriceV2) {
          originalPrice = Number(compareAtPriceV2.amount);
        } else {
          originalPrice = Number(priceV2.amount);
        }
      }

      return {
        variant: variants,
        variantID,
        title,
        image,
        originalPrice,
        priceAfterDiscount,
        quantity,
      };
    },
  );
}