import { z } from 'zod';
/** Common enums *************************************************************/
export declare const BlockTypeSchema: z.ZodEnum<{
    text: "text";
    image: "image";
    video: "video";
    title: "title";
    byline: "byline";
}>;
export type BlockType = z.infer<typeof BlockTypeSchema>;
export declare const AlignTypeSchema: z.ZodEnum<{
    "flex-start": "flex-start";
    center: "center";
    "flex-end": "flex-end";
}>;
export type AlignType = z.infer<typeof AlignTypeSchema>;
export declare const BreakpointIdSchema: z.ZodEnum<{
    mobile: "mobile";
    tablet: "tablet";
    desktop: "desktop";
}>;
export type BreakpointId = z.infer<typeof BreakpointIdSchema>;
export declare const PageStatusSchema: z.ZodEnum<{
    draft: "draft";
    published: "published";
}>;
export type PageStatus = z.infer<typeof PageStatusSchema>;
export declare const ViewModeSchema: z.ZodEnum<{
    list: "list";
    grid: "grid";
}>;
export type ViewMode = z.infer<typeof ViewModeSchema>;
/** Layout + responsive helpers **********************************************/
export declare const GridPlacementSchema: z.ZodObject<{
    row: z.ZodNumber;
    colStart: z.ZodNumber;
    colSpan: z.ZodNumber;
    rowSpan: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type GridPlacement = z.infer<typeof GridPlacementSchema>;
export declare const ResponsiveOverrideSchema: z.ZodObject<{
    fontSize: z.ZodOptional<z.ZodNumber>;
    layout: z.ZodOptional<z.ZodObject<{
        row: z.ZodOptional<z.ZodNumber>;
        colStart: z.ZodOptional<z.ZodNumber>;
        colSpan: z.ZodOptional<z.ZodNumber>;
        rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    }, z.core.$strip>>;
    hAlign: z.ZodOptional<z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>>;
    vAlign: z.ZodOptional<z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>>;
}, z.core.$strip>;
export type ResponsiveOverride = z.infer<typeof ResponsiveOverrideSchema>;
export declare const ResponsiveOverridesSchema: z.ZodObject<{
    mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        fontSize: z.ZodOptional<z.ZodNumber>;
        layout: z.ZodOptional<z.ZodObject<{
            row: z.ZodOptional<z.ZodNumber>;
            colStart: z.ZodOptional<z.ZodNumber>;
            colSpan: z.ZodOptional<z.ZodNumber>;
            rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        }, z.core.$strip>>;
        hAlign: z.ZodOptional<z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>>;
        vAlign: z.ZodOptional<z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>>;
    }, z.core.$strip>>>;
    tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        fontSize: z.ZodOptional<z.ZodNumber>;
        layout: z.ZodOptional<z.ZodObject<{
            row: z.ZodOptional<z.ZodNumber>;
            colStart: z.ZodOptional<z.ZodNumber>;
            colSpan: z.ZodOptional<z.ZodNumber>;
            rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        }, z.core.$strip>>;
        hAlign: z.ZodOptional<z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>>;
        vAlign: z.ZodOptional<z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>>;
    }, z.core.$strip>>>;
    desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        fontSize: z.ZodOptional<z.ZodNumber>;
        layout: z.ZodOptional<z.ZodObject<{
            row: z.ZodOptional<z.ZodNumber>;
            colStart: z.ZodOptional<z.ZodNumber>;
            colSpan: z.ZodOptional<z.ZodNumber>;
            rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        }, z.core.$strip>>;
        hAlign: z.ZodOptional<z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>>;
        vAlign: z.ZodOptional<z.ZodEnum<{
            "flex-start": "flex-start";
            center: "center";
            "flex-end": "flex-end";
        }>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type ResponsiveOverrides = z.infer<typeof ResponsiveOverridesSchema>;
export declare const ImageStyleSchema: z.ZodObject<{
    width: z.ZodOptional<z.ZodNumber>;
    widthUnit: z.ZodOptional<z.ZodEnum<{
        px: "px";
        "%": "%";
        vw: "vw";
        auto: "auto";
    }>>;
    height: z.ZodOptional<z.ZodNumber>;
    objectFit: z.ZodOptional<z.ZodEnum<{
        cover: "cover";
        contain: "contain";
    }>>;
}, z.core.$strip>;
export type ImageStyle = z.infer<typeof ImageStyleSchema>;
export declare const TitleBlockSchema: z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodNumber;
        colStart: z.ZodNumber;
        colSpan: z.ZodNumber;
        rowSpan: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNumber>;
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
    responsive: z.ZodOptional<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"title">;
    text: z.ZodString;
}, z.core.$strip>;
export type TitleBlock = z.infer<typeof TitleBlockSchema>;
export declare const BylineBlockSchema: z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodNumber;
        colStart: z.ZodNumber;
        colSpan: z.ZodNumber;
        rowSpan: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNumber>;
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
    responsive: z.ZodOptional<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"byline">;
    author: z.ZodString;
    publishedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type BylineBlock = z.infer<typeof BylineBlockSchema>;
export declare const TextBlockSchema: z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodNumber;
        colStart: z.ZodNumber;
        colSpan: z.ZodNumber;
        rowSpan: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNumber>;
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
    responsive: z.ZodOptional<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
}, z.core.$strip>;
export type TextBlock = z.infer<typeof TextBlockSchema>;
export declare const ImageBlockSchema: z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodNumber;
        colStart: z.ZodNumber;
        colSpan: z.ZodNumber;
        rowSpan: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNumber>;
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
    responsive: z.ZodOptional<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"image">;
    src: z.ZodString;
    alt: z.ZodOptional<z.ZodString>;
    mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    imageStyle: z.ZodOptional<z.ZodObject<{
        width: z.ZodOptional<z.ZodNumber>;
        widthUnit: z.ZodOptional<z.ZodEnum<{
            px: "px";
            "%": "%";
            vw: "vw";
            auto: "auto";
        }>>;
        height: z.ZodOptional<z.ZodNumber>;
        objectFit: z.ZodOptional<z.ZodEnum<{
            cover: "cover";
            contain: "contain";
        }>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ImageBlock = z.infer<typeof ImageBlockSchema>;
export declare const AnyBlockSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodNumber;
        colStart: z.ZodNumber;
        colSpan: z.ZodNumber;
        rowSpan: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNumber>;
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
    responsive: z.ZodOptional<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"title">;
    text: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodNumber;
        colStart: z.ZodNumber;
        colSpan: z.ZodNumber;
        rowSpan: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNumber>;
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
    responsive: z.ZodOptional<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"byline">;
    author: z.ZodString;
    publishedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodNumber;
        colStart: z.ZodNumber;
        colSpan: z.ZodNumber;
        rowSpan: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNumber>;
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
    responsive: z.ZodOptional<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    layout: z.ZodObject<{
        row: z.ZodNumber;
        colStart: z.ZodNumber;
        colSpan: z.ZodNumber;
        rowSpan: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    fontSize: z.ZodOptional<z.ZodNumber>;
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
    responsive: z.ZodOptional<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"image">;
    src: z.ZodString;
    alt: z.ZodOptional<z.ZodString>;
    mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    imageStyle: z.ZodOptional<z.ZodObject<{
        width: z.ZodOptional<z.ZodNumber>;
        widthUnit: z.ZodOptional<z.ZodEnum<{
            px: "px";
            "%": "%";
            vw: "vw";
            auto: "auto";
        }>>;
        height: z.ZodOptional<z.ZodNumber>;
        objectFit: z.ZodOptional<z.ZodEnum<{
            cover: "cover";
            contain: "contain";
        }>>;
    }, z.core.$strip>>;
}, z.core.$strip>], "type">;
export type AnyBlock = z.infer<typeof AnyBlockSchema>;
export declare const BlockUpdateSchema: z.ZodObject<{
    layout: z.ZodOptional<z.ZodObject<{
        row: z.ZodNumber;
        colStart: z.ZodNumber;
        colSpan: z.ZodNumber;
        rowSpan: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    text: z.ZodOptional<z.ZodString>;
    src: z.ZodOptional<z.ZodString>;
    alt: z.ZodOptional<z.ZodString>;
    mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    imageStyle: z.ZodOptional<z.ZodObject<{
        width: z.ZodOptional<z.ZodNumber>;
        widthUnit: z.ZodOptional<z.ZodEnum<{
            px: "px";
            "%": "%";
            vw: "vw";
            auto: "auto";
        }>>;
        height: z.ZodOptional<z.ZodNumber>;
        objectFit: z.ZodOptional<z.ZodEnum<{
            cover: "cover";
            contain: "contain";
        }>>;
    }, z.core.$strip>>;
    author: z.ZodOptional<z.ZodString>;
    format: z.ZodOptional<z.ZodString>;
    publishedAt: z.ZodOptional<z.ZodString>;
    fontSize: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    hAlign: z.ZodOptional<z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>>;
    vAlign: z.ZodOptional<z.ZodEnum<{
        "flex-start": "flex-start";
        center: "center";
        "flex-end": "flex-end";
    }>>;
    responsive: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
        desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            layout: z.ZodOptional<z.ZodObject<{
                row: z.ZodOptional<z.ZodNumber>;
                colStart: z.ZodOptional<z.ZodNumber>;
                colSpan: z.ZodOptional<z.ZodNumber>;
                rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            }, z.core.$strip>>;
            hAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
            vAlign: z.ZodOptional<z.ZodEnum<{
                "flex-start": "flex-start";
                center: "center";
                "flex-end": "flex-end";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type BlockUpdate = z.infer<typeof BlockUpdateSchema>;
/** Page + ancillary models **************************************************/
export declare const PageContentResponseSchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    title: z.ZodString;
    status: z.ZodEnum<{
        draft: "draft";
        published: "published";
    }>;
    updatedAt: z.ZodString;
    blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodNumber;
            colStart: z.ZodNumber;
            colSpan: z.ZodNumber;
            rowSpan: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNumber>;
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
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNumber>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodNumber>;
                    colStart: z.ZodOptional<z.ZodNumber>;
                    colSpan: z.ZodOptional<z.ZodNumber>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNumber>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodNumber>;
                    colStart: z.ZodOptional<z.ZodNumber>;
                    colSpan: z.ZodOptional<z.ZodNumber>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNumber>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodNumber>;
                    colStart: z.ZodOptional<z.ZodNumber>;
                    colSpan: z.ZodOptional<z.ZodNumber>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"title">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodNumber;
            colStart: z.ZodNumber;
            colSpan: z.ZodNumber;
            rowSpan: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNumber>;
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
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNumber>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodNumber>;
                    colStart: z.ZodOptional<z.ZodNumber>;
                    colSpan: z.ZodOptional<z.ZodNumber>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNumber>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodNumber>;
                    colStart: z.ZodOptional<z.ZodNumber>;
                    colSpan: z.ZodOptional<z.ZodNumber>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNumber>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodNumber>;
                    colStart: z.ZodOptional<z.ZodNumber>;
                    colSpan: z.ZodOptional<z.ZodNumber>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"byline">;
        author: z.ZodString;
        publishedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodNumber;
            colStart: z.ZodNumber;
            colSpan: z.ZodNumber;
            rowSpan: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNumber>;
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
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNumber>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodNumber>;
                    colStart: z.ZodOptional<z.ZodNumber>;
                    colSpan: z.ZodOptional<z.ZodNumber>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNumber>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodNumber>;
                    colStart: z.ZodOptional<z.ZodNumber>;
                    colSpan: z.ZodOptional<z.ZodNumber>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNumber>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodNumber>;
                    colStart: z.ZodOptional<z.ZodNumber>;
                    colSpan: z.ZodOptional<z.ZodNumber>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodObject<{
            row: z.ZodNumber;
            colStart: z.ZodNumber;
            colSpan: z.ZodNumber;
            rowSpan: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        fontSize: z.ZodOptional<z.ZodNumber>;
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
        responsive: z.ZodOptional<z.ZodObject<{
            mobile: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNumber>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodNumber>;
                    colStart: z.ZodOptional<z.ZodNumber>;
                    colSpan: z.ZodOptional<z.ZodNumber>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            tablet: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNumber>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodNumber>;
                    colStart: z.ZodOptional<z.ZodNumber>;
                    colSpan: z.ZodOptional<z.ZodNumber>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
            desktop: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                fontSize: z.ZodOptional<z.ZodNumber>;
                layout: z.ZodOptional<z.ZodObject<{
                    row: z.ZodOptional<z.ZodNumber>;
                    colStart: z.ZodOptional<z.ZodNumber>;
                    colSpan: z.ZodOptional<z.ZodNumber>;
                    rowSpan: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
                }, z.core.$strip>>;
                hAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
                vAlign: z.ZodOptional<z.ZodEnum<{
                    "flex-start": "flex-start";
                    center: "center";
                    "flex-end": "flex-end";
                }>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"image">;
        src: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
        mediaHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        imageStyle: z.ZodOptional<z.ZodObject<{
            width: z.ZodOptional<z.ZodNumber>;
            widthUnit: z.ZodOptional<z.ZodEnum<{
                px: "px";
                "%": "%";
                vw: "vw";
                auto: "auto";
            }>>;
            height: z.ZodOptional<z.ZodNumber>;
            objectFit: z.ZodOptional<z.ZodEnum<{
                cover: "cover";
                contain: "contain";
            }>>;
        }, z.core.$strip>>;
    }, z.core.$strip>], "type">>;
}, z.core.$strip>;
export type PageContentResponse = z.infer<typeof PageContentResponseSchema>;
export declare const DirectoryMetaSchema: z.ZodObject<{
    directory: z.ZodNullable<z.ZodString>;
    itemCount: z.ZodNumber;
    lastUploaded: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type DirectoryMeta = z.infer<typeof DirectoryMetaSchema>;
//# sourceMappingURL=content-block.model.d.ts.map