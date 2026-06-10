/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as features_auth_queries from "../features/auth/queries.js";
import type * as features_homepage_mutations from "../features/homepage/mutations.js";
import type * as features_homepage_queries from "../features/homepage/queries.js";
import type * as features_resources_blocks_mutations from "../features/resources/blocks/mutations.js";
import type * as features_resources_blocks_queries from "../features/resources/blocks/queries.js";
import type * as features_resources_lib_blockTypes from "../features/resources/lib/blockTypes.js";
import type * as features_resources_lib_imageContent from "../features/resources/lib/imageContent.js";
import type * as features_resources_lib_limits from "../features/resources/lib/limits.js";
import type * as features_resources_lib_linkContent from "../features/resources/lib/linkContent.js";
import type * as features_resources_lib_resourceIcons from "../features/resources/lib/resourceIcons.js";
import type * as features_resources_lib_validators from "../features/resources/lib/validators.js";
import type * as features_resources_mutations from "../features/resources/mutations.js";
import type * as features_resources_queries from "../features/resources/queries.js";
import type * as lib_allowlist from "../lib/allowlist.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_authedMutation from "../lib/authedMutation.js";
import type * as lib_jsonContent from "../lib/jsonContent.js";
import type * as lib_richTextHtml from "../lib/richTextHtml.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "features/auth/queries": typeof features_auth_queries;
  "features/homepage/mutations": typeof features_homepage_mutations;
  "features/homepage/queries": typeof features_homepage_queries;
  "features/resources/blocks/mutations": typeof features_resources_blocks_mutations;
  "features/resources/blocks/queries": typeof features_resources_blocks_queries;
  "features/resources/lib/blockTypes": typeof features_resources_lib_blockTypes;
  "features/resources/lib/imageContent": typeof features_resources_lib_imageContent;
  "features/resources/lib/limits": typeof features_resources_lib_limits;
  "features/resources/lib/linkContent": typeof features_resources_lib_linkContent;
  "features/resources/lib/resourceIcons": typeof features_resources_lib_resourceIcons;
  "features/resources/lib/validators": typeof features_resources_lib_validators;
  "features/resources/mutations": typeof features_resources_mutations;
  "features/resources/queries": typeof features_resources_queries;
  "lib/allowlist": typeof lib_allowlist;
  "lib/auth": typeof lib_auth;
  "lib/authedMutation": typeof lib_authedMutation;
  "lib/jsonContent": typeof lib_jsonContent;
  "lib/richTextHtml": typeof lib_richTextHtml;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
