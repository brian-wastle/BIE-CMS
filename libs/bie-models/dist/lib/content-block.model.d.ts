import { z } from 'zod';
export declare const BlockTypeSchema: z.ZodEnum<{
    text: "text";
    image: "image";
    video: "video";
    title: "title";
    byline: "byline";
    background: "background";
    divider: "divider";
}>;
export declare const AlignTypeSchema: z.ZodEnum<{
    "flex-start": "flex-start";
    center: "center";
    "flex-end": "flex-end";
}>;
export type AlignType = z.infer<typeof AlignTypeSchema>;
export declare const ViewModeSchema: z.ZodEnum<{
    list: "list";
    grid: "grid";
}>;
export type ViewMode = z.infer<typeof ViewModeSchema>;
export declare const BGStyleSchema: z.ZodEnum<{
    stretch: "stretch";
    tile: "tile";
}>;
export type BGStyle = z.infer<typeof BGStyleSchema>;
export declare const GridPlacementSchema: z.ZodObject<{
    row: z.ZodCoercedNumber<unknown>;
    colStart: z.ZodCoercedNumber<unknown>;
    colSpan: z.ZodCoercedNumber<unknown>;
    rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type GridPlacement = z.infer<typeof GridPlacementSchema>;
export declare const GridSettingsDefaults: {
    readonly columns: 12;
    readonly gapPx: 16;
    readonly rowHeight: 48;
};
export declare const GridSettingsSchema: z.ZodCatch<z.ZodObject<{
    columns: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    gapPx: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    rowHeight: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>>;
export type GridSettings = z.infer<typeof GridSettingsSchema>;
export declare const ImageStyleSchema: z.ZodObject<{
    columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strict>;
export type ImageStyle = z.infer<typeof ImageStyleSchema>;
export declare const TitleBlockSchema: z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"title">;
    text: z.ZodString;
}, z.core.$strip>;
export type TitleBlock = z.infer<typeof TitleBlockSchema>;
export declare const BylineBlockSchema: z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"byline">;
    author: z.ZodString;
    publishedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type BylineBlock = z.infer<typeof BylineBlockSchema>;
export declare const TextBlockSchema: z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
}, z.core.$strip>;
export type TextBlock = z.infer<typeof TextBlockSchema>;
export declare const ImageBlockSchema: z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"image">;
    src: z.ZodString;
    alt: z.ZodOptional<z.ZodString>;
    mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    imageStyle: z.ZodOptional<z.ZodObject<{
        columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strict>>;
}, z.core.$strip>;
export type ImageBlock = z.infer<typeof ImageBlockSchema>;
export declare const VideoBlockSchema: z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"video">;
    videoId: z.ZodString;
    videoUrl: z.ZodOptional<z.ZodString>;
    caption: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type VideoBlock = z.infer<typeof VideoBlockSchema>;
export declare const BGBlockSchema: z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"background">;
    src: z.ZodOptional<z.ZodString>;
    mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bgStyle: z.ZodDefault<z.ZodEnum<{
        stretch: "stretch";
        tile: "tile";
    }>>;
}, z.core.$strip>;
export type BGBlock = z.infer<typeof BGBlockSchema>;
export declare const DividerBlockSchema: z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"divider">;
}, z.core.$strip>;
export type DividerBlock = z.infer<typeof DividerBlockSchema>;
declare const BlockSchemas: readonly [z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"title">;
    text: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"byline">;
    author: z.ZodString;
    publishedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"video">;
    videoId: z.ZodString;
    videoUrl: z.ZodOptional<z.ZodString>;
    caption: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"image">;
    src: z.ZodString;
    alt: z.ZodOptional<z.ZodString>;
    mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    imageStyle: z.ZodOptional<z.ZodObject<{
        columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strict>>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"background">;
    src: z.ZodOptional<z.ZodString>;
    mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bgStyle: z.ZodDefault<z.ZodEnum<{
        stretch: "stretch";
        tile: "tile";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"divider">;
}, z.core.$strip>];
export declare const AnyBlockSchema: z.ZodDiscriminatedUnion<readonly [z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"title">;
    text: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"byline">;
    author: z.ZodString;
    publishedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"video">;
    videoId: z.ZodString;
    videoUrl: z.ZodOptional<z.ZodString>;
    caption: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"image">;
    src: z.ZodString;
    alt: z.ZodOptional<z.ZodString>;
    mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    imageStyle: z.ZodOptional<z.ZodObject<{
        columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strict>>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"background">;
    src: z.ZodOptional<z.ZodString>;
    mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bgStyle: z.ZodDefault<z.ZodEnum<{
        stretch: "stretch";
        tile: "tile";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodCoercedNumber<unknown>;
        colStart: z.ZodCoercedNumber<unknown>;
        colSpan: z.ZodCoercedNumber<unknown>;
        rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    color: z.ZodOptional<z.ZodString>;
    hAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    vAlign: z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>;
    type: z.ZodLiteral<"divider">;
}, z.core.$strip>], "type">;
export type AnyBlock = z.infer<typeof AnyBlockSchema>;
export declare const BlockUpdateSchema: z.ZodObject<{
    [x: string]: z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>;
}, z.core.$strip>;
type UnionToIntersection<U> = (U extends unknown ? (arg: U) => void : never) extends (arg: infer I) => void ? I : never;
type BlockPatchUnion = (typeof BlockSchemas)[number] extends infer Schema ? Schema extends z.ZodTypeAny ? Partial<Omit<z.infer<Schema>, 'id' | 'type'>> : never : never;
type BlockUpdateProps = UnionToIntersection<BlockPatchUnion>;
type Simplify<T> = {
    [K in keyof T]: T[K];
};
export type BlockUpdate = Simplify<z.infer<typeof BlockUpdateSchema> & BlockUpdateProps>;
export declare const DirectoryMetaSchema: z.ZodObject<{
    directory: z.ZodNullable<z.ZodString>;
    itemCount: z.ZodNumber;
    lastUploaded: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type DirectoryMeta = z.infer<typeof DirectoryMetaSchema>;
export declare const PageMetaSchema: z.ZodCatch<z.ZodObject<{
    seoTitle: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    keywords: z.ZodOptional<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodArray<z.ZodString>>>;
    canonicalUrl: z.ZodOptional<z.ZodString>;
    robots: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    ogTitle: z.ZodOptional<z.ZodString>;
    ogDescription: z.ZodOptional<z.ZodString>;
    ogUrl: z.ZodOptional<z.ZodString>;
    ogType: z.ZodOptional<z.ZodEnum<{
        website: "website";
        article: "article";
        profile: "profile";
    }>>;
    twitterCard: z.ZodOptional<z.ZodEnum<{
        summary: "summary";
        summary_large_image: "summary_large_image";
    }>>;
    twitterTitle: z.ZodOptional<z.ZodString>;
    twitterDescription: z.ZodOptional<z.ZodString>;
    jsonLd: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
}, z.core.$strip>>;
export type PageMeta = z.infer<typeof PageMetaSchema>;
export declare const PageStatusSchema: z.ZodEnum<{
    draft: "draft";
    published: "published";
}>;
export type PageStatus = z.infer<typeof PageStatusSchema>;
export declare const PageSchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    status: z.ZodEnum<{
        draft: "draft";
        published: "published";
    }>;
    title: z.ZodString;
    blocks: z.ZodArray<z.ZodDiscriminatedUnion<readonly [z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"title">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"byline">;
        author: z.ZodString;
        publishedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"video">;
        videoId: z.ZodString;
        videoUrl: z.ZodOptional<z.ZodString>;
        caption: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"image">;
        src: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
        mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        imageStyle: z.ZodOptional<z.ZodObject<{
            columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strict>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"background">;
        src: z.ZodOptional<z.ZodString>;
        mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        bgStyle: z.ZodDefault<z.ZodEnum<{
            stretch: "stretch";
            tile: "tile";
        }>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"divider">;
    }, z.core.$strip>], "type">>;
    grid: z.ZodDefault<z.ZodCatch<z.ZodObject<{
        columns: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        gapPx: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        rowHeight: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>>>;
    meta: z.ZodOptional<z.ZodCatch<z.ZodObject<{
        seoTitle: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        keywords: z.ZodOptional<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodArray<z.ZodString>>>;
        canonicalUrl: z.ZodOptional<z.ZodString>;
        robots: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        ogTitle: z.ZodOptional<z.ZodString>;
        ogDescription: z.ZodOptional<z.ZodString>;
        ogUrl: z.ZodOptional<z.ZodString>;
        ogType: z.ZodOptional<z.ZodEnum<{
            website: "website";
            article: "article";
            profile: "profile";
        }>>;
        twitterCard: z.ZodOptional<z.ZodEnum<{
            summary: "summary";
            summary_large_image: "summary_large_image";
        }>>;
        twitterTitle: z.ZodOptional<z.ZodString>;
        twitterDescription: z.ZodOptional<z.ZodString>;
        jsonLd: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    }, z.core.$strip>>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type Page = z.infer<typeof PageSchema>;
export declare const PageWriteSchema: z.ZodObject<{
    title: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        published: "published";
    }>>;
    blocks: z.ZodArray<z.ZodDiscriminatedUnion<readonly [z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"title">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"byline">;
        author: z.ZodString;
        publishedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"video">;
        videoId: z.ZodString;
        videoUrl: z.ZodOptional<z.ZodString>;
        caption: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"image">;
        src: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
        mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        imageStyle: z.ZodOptional<z.ZodObject<{
            columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strict>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"background">;
        src: z.ZodOptional<z.ZodString>;
        mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        bgStyle: z.ZodDefault<z.ZodEnum<{
            stretch: "stretch";
            tile: "tile";
        }>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"divider">;
    }, z.core.$strip>], "type">>;
    grid: z.ZodDefault<z.ZodCatch<z.ZodObject<{
        columns: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        gapPx: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        rowHeight: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>>>;
    meta: z.ZodOptional<z.ZodCatch<z.ZodObject<{
        seoTitle: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        keywords: z.ZodOptional<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodArray<z.ZodString>>>;
        canonicalUrl: z.ZodOptional<z.ZodString>;
        robots: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        ogTitle: z.ZodOptional<z.ZodString>;
        ogDescription: z.ZodOptional<z.ZodString>;
        ogUrl: z.ZodOptional<z.ZodString>;
        ogType: z.ZodOptional<z.ZodEnum<{
            website: "website";
            article: "article";
            profile: "profile";
        }>>;
        twitterCard: z.ZodOptional<z.ZodEnum<{
            summary: "summary";
            summary_large_image: "summary_large_image";
        }>>;
        twitterTitle: z.ZodOptional<z.ZodString>;
        twitterDescription: z.ZodOptional<z.ZodString>;
        jsonLd: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    }, z.core.$strip>>>;
    publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    slug: z.ZodString;
}, z.core.$strip>;
export type PageWrite = z.infer<typeof PageWriteSchema>;
export declare const PageUpdateSchema: z.ZodObject<{
    title: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        published: "published";
    }>>;
    blocks: z.ZodArray<z.ZodDiscriminatedUnion<readonly [z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"title">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"byline">;
        author: z.ZodString;
        publishedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"video">;
        videoId: z.ZodString;
        videoUrl: z.ZodOptional<z.ZodString>;
        caption: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"image">;
        src: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
        mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        imageStyle: z.ZodOptional<z.ZodObject<{
            columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strict>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"background">;
        src: z.ZodOptional<z.ZodString>;
        mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        bgStyle: z.ZodDefault<z.ZodEnum<{
            stretch: "stretch";
            tile: "tile";
        }>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodCoercedNumber<unknown>;
            colStart: z.ZodCoercedNumber<unknown>;
            colSpan: z.ZodCoercedNumber<unknown>;
            rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        color: z.ZodOptional<z.ZodString>;
        hAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        vAlign: z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>;
        type: z.ZodLiteral<"divider">;
    }, z.core.$strip>], "type">>;
    grid: z.ZodDefault<z.ZodCatch<z.ZodObject<{
        columns: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        gapPx: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        rowHeight: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>>>;
    meta: z.ZodOptional<z.ZodCatch<z.ZodObject<{
        seoTitle: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        keywords: z.ZodOptional<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodArray<z.ZodString>>>;
        canonicalUrl: z.ZodOptional<z.ZodString>;
        robots: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        ogTitle: z.ZodOptional<z.ZodString>;
        ogDescription: z.ZodOptional<z.ZodString>;
        ogUrl: z.ZodOptional<z.ZodString>;
        ogType: z.ZodOptional<z.ZodEnum<{
            website: "website";
            article: "article";
            profile: "profile";
        }>>;
        twitterCard: z.ZodOptional<z.ZodEnum<{
            summary: "summary";
            summary_large_image: "summary_large_image";
        }>>;
        twitterTitle: z.ZodOptional<z.ZodString>;
        twitterDescription: z.ZodOptional<z.ZodString>;
        jsonLd: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    }, z.core.$strip>>>;
    publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    slug: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PageUpdate = z.infer<typeof PageUpdateSchema>;
export declare const PageSummarySchema: z.ZodObject<{
    page: z.ZodObject<{
        id: z.ZodString;
        slug: z.ZodString;
        status: z.ZodEnum<{
            draft: "draft";
            published: "published";
        }>;
        title: z.ZodString;
        blocks: z.ZodArray<z.ZodDiscriminatedUnion<readonly [z.ZodObject<{
            id: z.ZodString;
            layout: z.ZodObject<{
                row: z.ZodCoercedNumber<unknown>;
                colStart: z.ZodCoercedNumber<unknown>;
                colSpan: z.ZodCoercedNumber<unknown>;
                rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            color: z.ZodOptional<z.ZodString>;
            hAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            vAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            type: z.ZodLiteral<"title">;
            text: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            id: z.ZodString;
            layout: z.ZodObject<{
                row: z.ZodCoercedNumber<unknown>;
                colStart: z.ZodCoercedNumber<unknown>;
                colSpan: z.ZodCoercedNumber<unknown>;
                rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            color: z.ZodOptional<z.ZodString>;
            hAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            vAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            type: z.ZodLiteral<"byline">;
            author: z.ZodString;
            publishedAt: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            id: z.ZodString;
            layout: z.ZodObject<{
                row: z.ZodCoercedNumber<unknown>;
                colStart: z.ZodCoercedNumber<unknown>;
                colSpan: z.ZodCoercedNumber<unknown>;
                rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            color: z.ZodOptional<z.ZodString>;
            hAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            vAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            type: z.ZodLiteral<"text">;
            text: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            id: z.ZodString;
            layout: z.ZodObject<{
                row: z.ZodCoercedNumber<unknown>;
                colStart: z.ZodCoercedNumber<unknown>;
                colSpan: z.ZodCoercedNumber<unknown>;
                rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            color: z.ZodOptional<z.ZodString>;
            hAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            vAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            type: z.ZodLiteral<"video">;
            videoId: z.ZodString;
            videoUrl: z.ZodOptional<z.ZodString>;
            caption: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>, z.ZodObject<{
            id: z.ZodString;
            layout: z.ZodObject<{
                row: z.ZodCoercedNumber<unknown>;
                colStart: z.ZodCoercedNumber<unknown>;
                colSpan: z.ZodCoercedNumber<unknown>;
                rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            color: z.ZodOptional<z.ZodString>;
            hAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            vAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            type: z.ZodLiteral<"image">;
            src: z.ZodString;
            alt: z.ZodOptional<z.ZodString>;
            mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            imageStyle: z.ZodOptional<z.ZodObject<{
                columns: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strict>>;
        }, z.core.$strip>, z.ZodObject<{
            id: z.ZodString;
            layout: z.ZodObject<{
                row: z.ZodCoercedNumber<unknown>;
                colStart: z.ZodCoercedNumber<unknown>;
                colSpan: z.ZodCoercedNumber<unknown>;
                rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            color: z.ZodOptional<z.ZodString>;
            hAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            vAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            type: z.ZodLiteral<"background">;
            src: z.ZodOptional<z.ZodString>;
            mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bgStyle: z.ZodDefault<z.ZodEnum<{
                stretch: "stretch";
                tile: "tile";
            }>>;
        }, z.core.$strip>, z.ZodObject<{
            id: z.ZodString;
            layout: z.ZodObject<{
                row: z.ZodCoercedNumber<unknown>;
                colStart: z.ZodCoercedNumber<unknown>;
                colSpan: z.ZodCoercedNumber<unknown>;
                rowSpan: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
            }, z.core.$strip>;
            fontSize: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
            color: z.ZodOptional<z.ZodString>;
            hAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            vAlign: z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>;
            type: z.ZodLiteral<"divider">;
        }, z.core.$strip>], "type">>;
        grid: z.ZodDefault<z.ZodCatch<z.ZodObject<{
            columns: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
            gapPx: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
            rowHeight: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        }, z.core.$strip>>>;
        meta: z.ZodOptional<z.ZodCatch<z.ZodObject<{
            seoTitle: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            keywords: z.ZodOptional<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodArray<z.ZodString>>>;
            canonicalUrl: z.ZodOptional<z.ZodString>;
            robots: z.ZodOptional<z.ZodString>;
            author: z.ZodOptional<z.ZodString>;
            ogTitle: z.ZodOptional<z.ZodString>;
            ogDescription: z.ZodOptional<z.ZodString>;
            ogUrl: z.ZodOptional<z.ZodString>;
            ogType: z.ZodOptional<z.ZodEnum<{
                website: "website";
                article: "article";
                profile: "profile";
            }>>;
            twitterCard: z.ZodOptional<z.ZodEnum<{
                summary: "summary";
                summary_large_image: "summary_large_image";
            }>>;
            twitterTitle: z.ZodOptional<z.ZodString>;
            twitterDescription: z.ZodOptional<z.ZodString>;
            jsonLd: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
        }, z.core.$strip>>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type PageSummary = z.infer<typeof PageSummarySchema>;
export {};
//# sourceMappingURL=content-block.model.d.ts.map