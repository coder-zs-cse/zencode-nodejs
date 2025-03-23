const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');


const formTemplateString = `import React, { ChangeEventHandler } from "react";
import {
  useForm,
  SubmitHandler,
  FieldValues,
  Path,
  FieldError,
  DefaultValues,
  Control,
} from "react-hook-form";
import Select from "../Select/Select";
import Input from "../Input/Input";
import Button from "../Button/Button";
import PhoneInput from "../PhoneInput/PhoneInput";
import DateInput from "../DateInput/DateInput";
import { formStyles } from "@/Styles/GlobalStyle/FromStyle";
import { ButtonSize, ButtonVariant } from "@/Constants/Enum/VarientEnum";
import FileUpload from "../FileUpload/FileUpload";
import CountrySelect from "../CountrySelect/CountrySelect";
import { Data } from "@/Constants";
import TextArea from "../TextArea/TextArea";
import { Checkbox, RangeSlider } from "@/Components/Global";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType } from "zod";
import Label from "../Label/Label";

const styles = formStyles();

export type FormField = {
  name: string;
  type: string;
  label: string | JSX.Element;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  required?: boolean;
  showRequiredStar?: boolean;
  className?: string;
  disabled?: boolean;
  defaultValue?: any;
  onSelectChange?: ChangeEventHandler<HTMLSelectElement> | undefined;
  min?: number;
  max?: number;
  step?: number;
  attribute?: string;
  labelClassName?: string;
  component?: React.ReactNode;
  currencySymbol?: boolean;
  checkboxColor?: string;
  iconClassName?: string;
  handelOnDelete?: any;
};

interface FormProps<TFieldValues extends FieldValues> {
  formFields: FormField[][];
  onSubmit: SubmitHandler<TFieldValues>;
  submitButtonText?: string;
  submitButtonProps?: Partial<React.ComponentProps<typeof Button>>;
  formClassName?: string;
  children?: React.ReactNode;
  secondaryButton?: React.ReactNode;
  showSubmitButton?: boolean;
  onChange?: (name: string, value: any) => void;
  formRef?: any;
  validationSchema?: ZodType<any>;
  isEditing?: boolean;
  iconClassName?: any;
  labelClassName?: string;
}

const Form = <TFieldValues extends FieldValues>({
  formFields,
  onSubmit,
  submitButtonText = "Submit",
  submitButtonProps = {},
  formClassName = "",
  children,
  secondaryButton,
  showSubmitButton = true,
  onChange,
  formRef,
  validationSchema,
  isEditing,
}: FormProps<TFieldValues>): JSX.Element => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TFieldValues>({
    defaultValues: Object.fromEntries(
      formFields.flat().map((field) => [field.name, field.defaultValue])
    ) as DefaultValues<TFieldValues>,
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
  });

  const handleCountryChange = (name: string, code: string, label: string) => {
    if (onChange) {
      onChange(name, { code, label });
    }
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      name: field.name as Path<TFieldValues>,
      control,
      label: field.label as string,
      placeholder: field.placeholder,
      required: field.required,
      disabled: field.disabled,
      error: errors[field.name as keyof TFieldValues] as FieldError | undefined,
      onChange: (value: any) => {
        if (onChange) {
          onChange(field.name, value);
        }
      },
    };

    switch (field.type) {
      case "label":
        return (
          <Label label={field.label} labelClassName={field.labelClassName} />
        );
      case "select":
        return (
          <Select<TFieldValues>
            {...commonProps}
            options={field.options || []}
            className={field.className}
            labelClassName={field.labelClassName}
            onChange={(name, value) => {
              if (onChange) {
                onChange(name, value);
              }
            }}
            isEditing={isEditing}
          />
        );
      case "phone":
        return (
          <PhoneInput<TFieldValues>
            {...commonProps}
            className={field.className}
            labelClassName={field.labelClassName}
            countryOptions={Data?.CountryData?.map((country) => ({
              value: country.name,
              label: country.name,
              dialCode: country.dial_code,
              ...country,
            }))}
            defaultValue={field.defaultValue}
            onChange={(name, value) => {
              if (onChange) {
                onChange(name, value);
              }
            }}
          />
        );
      case "date":
        return (
          <DateInput<TFieldValues>
            {...commonProps}
            labelClassName={field.labelClassName}
          />
        );
      case "file":
        return (
          <FileUpload<TFieldValues>
            {...commonProps}
            defaultValue={field.defaultValue}
            labelClassName={field.labelClassName}
            dropzoneText={field.placeholder}
            className={field.className}
            onChange={(name, value) => {
              if (onChange) {
                onChange(name, value);
              }
            }}
          />
        );
      case "textArea":
        return (
          <TextArea<TFieldValues>
            {...commonProps}
            labelClassName={field.labelClassName}
            className={field.className}
          />
        );

      case "countrySelect":
        return (
          <CountrySelect<TFieldValues>
            {...commonProps}
            options={Data?.CountryData?.map((country) => ({
              value: country.name,
              label: country.name,
              ...country,
            }))}
            labelClassName={field.labelClassName}
            className={field.className}
            onChange={(name, code, label) =>
              handleCountryChange(name, code, label)
            }
          />
        );
      case "range":
        return (
          <RangeSlider<TFieldValues>
            labelClassName={field.labelClassName || ""}
            {...commonProps}
            min={field.min || 0}
            max={field.max || 100}
            step={field.step || 1}
            attribute={field.attribute || ""}
          />
        );
      case "checkbox":
        return (
          <Checkbox
            {...commonProps}
            checkboxColor={field.checkboxColor}
            labelClassName={field.labelClassName || ""}
          />
        );
      case "component":
        return field.component;
      case "number":
        return (
          <Input<TFieldValues>
            {...commonProps}
            type={field.type}
            showRequiredStar={field.showRequiredStar}
            className={field.className}
            labelClassName={field.labelClassName}
            currencySymbol={field.currencySymbol}
          />
        );
      default:
        return (
          <Input<TFieldValues>
            {...commonProps}
            type={field.type}
            showRequiredStar={field.showRequiredStar}
            className={field.className}
            labelClassName={field.labelClassName}
          />
        );
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      className={\`w-full \${formClassName}\`}
    >
      <div className={styles.formContent()}>
        {formFields?.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row()}>
            {row?.map((field: FormField, fieldIndex: number) => (
              <div
                key={\`\${rowIndex}-\${fieldIndex}\`}
                className={styles.fieldWrapper({
                  class: \`\${
                    row.length === 2
                      ? "sm:w-1/2"
                      : row.length > 2
                      ? "sm:w-1/2 lg:w-1/3"
                      : "w-full"
                  }\`,
                })}
              >
                {renderField(field)}
              </div>
            ))}
          </div>
        ))}
        {children}
      </div>

      <div className={styles.buttonContainer()}>
        {secondaryButton && (
          <div className={styles.buttonWrapper()}>{secondaryButton}</div>
        )}
        {showSubmitButton && (
          <Button
            type="submit"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            disabled={isSubmitting}
            className={styles.buttonWrapper()}
            {...submitButtonProps}
          >
            {submitButtonText}
          </Button>
        )}
      </div>
    </form>
  );
};

export default Form;`

const galleryString = `import React, { useState } from "react";
import Image from "next/image";
import Button from "../Button/Button";
import { ButtonVariant } from "@/Constants/Enum/VarientEnum";
import { Icons } from "@/Asset";
import Modal from "../Modal/Modal";
import ReactImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

interface ImageGalleryProps {
  images: string[] | null;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, className = 'className-1' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const renderImage = (src: string, index: number) => (
    <div key={index} className="relative w-full h-full">
      <Image
        src={src}
        alt={\`Gallery image \${index + 1}\`}
        layout="fill"
        objectFit="cover"
        className="rounded-[12px]"
      />
    </div>
  );

  const renderOneImage = (images: string[]) => (
    <div className="grid h-full">
      {renderImage(images[0], 0)}
    </div>
  );

  const renderTwoImages = (images: string[]) => (
    <div className={\`grid grid-cols-2 h-full \${className}\`}>
      {images.map((src, index) => renderImage(src, index))}
    </div>
  );

  const renderThreeImages = (images: string[]) => (
    <div className={\`grid grid-cols-2 grid-rows-2 h-full \${className}\`}>
      <div className="row-span-2">{renderImage(images[0], 0)}</div>
      {images.slice(1).map((src, index) => renderImage(src, index + 1))}
    </div>
  );

  const renderFourImages = (images: string[]) => (
    <div className={\`grid grid-cols-2 grid-rows-2 h-full \${className}\`}>
      {images.map((src, index) => renderImage(src, index))}
    </div>
  );

  const renderFiveOrMoreImages = (images: string[]) => (
    <div className="w-full h-full">
      {/* Large screen layout (hidden on small screens) */}
      <div className={\`hidden md:grid grid-cols-3 grid-rows-1 h-full \${className}\`}>
        <div className="col-span-1 row-span-1">{renderImage(images[0], 0)}</div>
        <div className={\`grid grid-cols-2 grid-rows-2 col-span-1 row-span-1 \${className}\`}>
          <div className="col-span-2 row-span-1">{renderImage(images[1], 1)}</div>
          <div className="col-span-1 row-span-1">{renderImage(images[2], 2)}</div>
          <div className="col-span-1 row-span-1">{renderImage(images[3], 3)}</div>
        </div>
        <div className="col-span-1 row-span-1">{renderImage(images[4], 4)}</div>
      </div>

      {/* Small screen layout (hidden on medium screens and above) */}
      <div className={\`md:hidden grid grid-cols-2 grid-rows-2 h-full \${className}\`}>
        <div className={\`grid grid-cols-2 grid-rows-1 col-span-2 row-span-1 \${className}\`}>
          <div className="col-span-1 row-span-1">{renderImage(images[0], 0)}</div>
          <div className={\`grid grid-cols-2 grid-rows-2 col-span-1 row-span-1\${className}\`}>
            <div className="row-span-1 col-span-2">{renderImage(images[1], 1)}</div>
            <div className="row-span-1 col-span-1">{renderImage(images[2], 2)}</div>
            <div className="row-span-1 col-span-1">{renderImage(images[3], 3)}</div>
          </div>
        </div>
        <div className="col-span-2 row-span-1">{renderImage(images[4], 1)}</div>
      </div> 
    </div>
  );

  
  const renderImages = (images: string[]) => {
    const count = images.length;
    switch (count) {
      case 1: return renderOneImage(images);
      case 2: return renderTwoImages(images);
      case 3: return renderThreeImages(images);
      case 4: return renderFourImages(images);
      default: return renderFiveOrMoreImages(images.slice(0, 5));
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const galleryItems = images?.map(src => ({
    original: src,
    thumbnail: src,
    originalHeight: 600,
    originalWidth: 100,
    thumbnailHeight: 80,
    thumbnailWidth: 120,
    renderItem: (item: any) => (
      <div className="image-gallery-image">
        <img
          src={item.original}
          alt={item.originalAlt}
          style={{ objectFit: 'contain', width: '100%', height: '100%', maxHeight: '600px' }}
        />
      </div>
    ),
  })) || [];

  return (
    <div className="relative w-full h-80">
      {images && renderImages(images)}
      {images && images.length > 3 && (
        <div className="absolute bottom-5 right-5">
          <Button
            variant={ButtonVariant.Secondary}
            startIcon={<Image src={Icons.ViewAllIcon} alt="View all photos" width={14} height={14} />}
            className="h-[28px] text-[14px] leading-[17.64px] px-[10px] rounded-[8px] bg-white font-plus-jakarta-sans font-semibold flex items-center justify-center border-white"
            onClick={openModal}
          >
            Show all photos
          </Button>
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="All Photos"
        width="90%"
        height="90%"
        modalClassName="z-50 bg-white rounded-lg shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        bodyClassName="h-full"
      >
        <div className="h-full">
          <ReactImageGallery
            items={galleryItems}
            showPlayButton={false}
            showFullscreenButton={true}
            showNav={true}
            showThumbnails={true}
            thumbnailPosition="bottom"
            useBrowserFullscreen={false}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ImageGallery;`

function parseReactComponent(code) {
  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        'classProperties',
        'objectRestSpread',
        'decorators-legacy'
      ]
    });

    const componentInfo = {
      name: null,
      props: [],
      dependencies: [],
      isTypescript: false,
      exports: [],
      methods: [],
      jsxElements: []
    };

    // Track encountered prop names to avoid duplication
    const propNames = new Set();
    
    // Helper to add a prop while avoiding duplicates
    const addProp = (prop) => {
      if (!propNames.has(prop.name)) {
        propNames.add(prop.name);
        componentInfo.props.push(prop);
        return true;
      }
      return false;
    };
    
    // Track imports
    traverse(ast, {
      ImportDeclaration(path) {
        componentInfo.dependencies.push(path.node.source.value);
      }
    });

    // Find exported components
    traverse(ast, {
      ExportDefaultDeclaration(path) {
        if (t.isIdentifier(path.node.declaration)) {
          componentInfo.name = path.node.declaration.name;
          componentInfo.exports.push('default');
        } else if (t.isFunctionDeclaration(path.node.declaration)) {
          componentInfo.name = path.node.declaration.id?.name;
          componentInfo.exports.push('default');
        } else if (t.isArrowFunctionExpression(path.node.declaration) && path.node.declaration.id) {
          componentInfo.name = path.node.declaration.id.name;
          componentInfo.exports.push('default');
        }
      },
      ExportNamedDeclaration(path) {
        if (path.node.declaration) {
          if (t.isFunctionDeclaration(path.node.declaration)) {
            componentInfo.name = path.node.declaration.id.name;
            componentInfo.exports.push('named');
          }
        }
      }
    });

    // First scan the interfaces and types which have the highest quality information
    traverse(ast, {
      // Add support for TypeScript type aliases (export type FormField = {...})
      TSTypeAliasDeclaration(path) {
        // Capture types that might be prop related
        if (path.node.id.name.includes('Props') || 
            path.node.id.name.includes('Field') ||
            path.node.id.name.includes('ComponentProps')) {
          componentInfo.isTypescript = true;
          
          // Handle type objects
          if (t.isTSTypeLiteral(path.node.typeAnnotation)) {
            const members = path.node.typeAnnotation.members;
            if (Array.isArray(members)) {
              members.forEach(member => {
                let type = 'unknown';
                let typeDetails = null;
                
                try {
                  if (member.typeAnnotation?.typeAnnotation) {
                    const typeAnnotation = member.typeAnnotation.typeAnnotation;
                    
                    if (t.isTSFunctionType(typeAnnotation)) {
                      type = 'function';
                    } else if (t.isTSTypeReference(typeAnnotation)) {
                      type = typeAnnotation.typeName.name;
                    } else {
                      type = typeAnnotation.type
                        .replace('TS', '')
                        .replace('Keyword', '')
                        .toLowerCase();
                    }
                    
                    // Handle array types with more detail
                    if (t.isTSArrayType(typeAnnotation)) {
                      let elementType = 'unknown';
                      
                      // Get the element type of the array
                      if (t.isTSTypeLiteral(typeAnnotation.elementType)) {
                        // For object array elements like { value: string | number; label: string }[]
                        type = 'array';
                        elementType = 'object';
                        const arrayMembers = typeAnnotation.elementType.members;
                        if (Array.isArray(arrayMembers)) {
                          typeDetails = {
                            arrayOf: elementType,
                            elementType: elementType,
                            objectShape: arrayMembers.map(arrayMember => {
                              let memberType = 'unknown';
                              
                              try {
                                if (arrayMember.typeAnnotation?.typeAnnotation) {
                                  const memberTypeAnnotation = arrayMember.typeAnnotation.typeAnnotation;
                                  
                                  if (t.isTSUnionType(memberTypeAnnotation)) {
                                    memberType = memberTypeAnnotation.types.map(unionType => 
                                      unionType.type.replace('TS', '').replace('Keyword', '').toLowerCase()
                                    ).join(' | ');
                                  } else if (t.isTSTypeReference(memberTypeAnnotation)) {
                                    memberType = memberTypeAnnotation.typeName.name;
                                  } else {
                                    memberType = memberTypeAnnotation.type
                                      .replace('TS', '')
                                      .replace('Keyword', '')
                                      .toLowerCase();
                                  }
                                }
                              } catch (e) {
                                console.warn('Error parsing array member type:', arrayMember.key?.name);
                              }
                              
                              return {
                                name: arrayMember.key?.name,
                                type: memberType,
                                optional: arrayMember.optional || false
                              };
                            }).filter(prop => prop.name)
                          };
                        }
                      } else if (t.isTSTypeReference(typeAnnotation.elementType)) {
                        // Handle arrays of referenced types (e.g., MyType[])
                        type = 'array';
                        elementType = typeAnnotation.elementType.typeName.name;
                        typeDetails = {
                          arrayOf: elementType,
                          elementType: elementType
                        };
                      } else {
                        // Handle arrays of primitive types (e.g., string[])
                        type = 'array';
                        elementType = typeAnnotation.elementType.type
                          .replace('TS', '')
                          .replace('Keyword', '')
                          .toLowerCase();
                        typeDetails = {
                          arrayOf: elementType,
                          elementType: elementType
                        };
                      }
                      
                      // Format the type consistently as elementType[]
                      type = `${elementType}[]`;
                    }
                    
                    // Handle union types
                    if (t.isTSUnionType(typeAnnotation)) {
                      type = 'union';
                      typeDetails = {
                        unionOf: typeAnnotation.types.map(unionType => {
                          // Special handling for array types within unions
                          if (t.isTSArrayType(unionType)) {
                            // Extract the element type of the array
                            let elementType = 'unknown';
                            
                            if (t.isTSTypeReference(unionType.elementType)) {
                              elementType = unionType.elementType.typeName.name;
                            } else {
                              elementType = unionType.elementType.type
                                .replace('TS', '')
                                .replace('Keyword', '')
                                .toLowerCase();
                            }
                            
                            return `${elementType}[]`;
                          } else if (t.isTSTypeReference(unionType)) {
                            return unionType.typeName.name;
                          } else {
                            return unionType.type
                              .replace('TS', '')
                              .replace('Keyword', '')
                              .toLowerCase();
                          }
                        })
                      };
                    }
                  }
                } catch (e) {
                  console.warn('Error parsing type for member:', member.key?.name, e);
                }

                // Add the prop to the component info, avoiding duplicates
                addProp({
                  name: member.key?.name,
                  type,
                  typeDetails,
                  optional: member.optional || false,
                  source: 'type-alias'
                });
              });
            }
          }
        }
      },
      
      // Similar updates for TSInterfaceDeclaration
      TSInterfaceDeclaration(path) {
        // Check for interfaces that might be prop types (not just 'Props')
        if (path.node.id.name.includes('Props') || path.node.id.name.includes('props')) {
          componentInfo.isTypescript = true;
          if (Array.isArray(path.node.body.body)) {
            path.node.body.body.forEach(member => {
              let type = 'unknown';
              let typeDetails = null;
              
              try {
                if (member.typeAnnotation?.typeAnnotation) {
                  const typeAnnotation = member.typeAnnotation.typeAnnotation;
                  
                  if (t.isTSFunctionType(typeAnnotation)) {
                    type = 'function';
                  } else if (t.isTSTypeReference(typeAnnotation)) {
                    type = typeAnnotation.typeName.name;
                  } else {
                    type = typeAnnotation.type
                      .replace('TS', '')
                      .replace('Keyword', '')
                      .toLowerCase();
                  }
                  
                  // Handle array types with more detail
                  if (t.isTSArrayType(typeAnnotation)) {
                    let elementType = 'unknown';
                    
                    // Get the element type of the array
                    if (t.isTSTypeLiteral(typeAnnotation.elementType)) {
                      // For object array elements like { value: string | number; label: string }[]
                      type = 'array';
                      elementType = 'object';
                      const arrayMembers = typeAnnotation.elementType.members;
                      if (Array.isArray(arrayMembers)) {
                        typeDetails = {
                          arrayOf: elementType,
                          elementType: elementType,
                          objectShape: arrayMembers.map(arrayMember => {
                            let memberType = 'unknown';
                            
                            try {
                              if (arrayMember.typeAnnotation?.typeAnnotation) {
                                const memberTypeAnnotation = arrayMember.typeAnnotation.typeAnnotation;
                                
                                if (t.isTSUnionType(memberTypeAnnotation)) {
                                  memberType = memberTypeAnnotation.types.map(unionType => 
                                    unionType.type.replace('TS', '').replace('Keyword', '').toLowerCase()
                                  ).join(' | ');
                                } else if (t.isTSTypeReference(memberTypeAnnotation)) {
                                  memberType = memberTypeAnnotation.typeName.name;
                                } else {
                                  memberType = memberTypeAnnotation.type
                                    .replace('TS', '')
                                    .replace('Keyword', '')
                                    .toLowerCase();
                                }
                              }
                            } catch (e) {
                              console.warn('Error parsing array member type:', arrayMember.key?.name);
                            }
                            
                            return {
                              name: arrayMember.key?.name,
                              type: memberType,
                              optional: arrayMember.optional || false
                            };
                          }).filter(prop => prop.name)
                        };
                      }
                    } else if (t.isTSTypeReference(typeAnnotation.elementType)) {
                      // Handle arrays of referenced types (e.g., MyType[])
                      type = 'array';
                      elementType = typeAnnotation.elementType.typeName.name;
                      typeDetails = {
                        arrayOf: elementType,
                        elementType: elementType
                      };
                    } else {
                      // Handle arrays of primitive types (e.g., string[])
                      type = 'array';
                      elementType = typeAnnotation.elementType.type
                        .replace('TS', '')
                        .replace('Keyword', '')
                        .toLowerCase();
                      typeDetails = {
                        arrayOf: elementType,
                        elementType: elementType
                      };
                    }
                    
                    // Format the type consistently as elementType[]
                    type = `${elementType}[]`;
                  }
                  
                  // Handle union types
                  if (t.isTSUnionType(typeAnnotation)) {
                    type = 'union';
                    typeDetails = {
                      unionOf: typeAnnotation.types.map(unionType => {
                        // Special handling for array types within unions
                        if (t.isTSArrayType(unionType)) {
                          // Extract the element type of the array
                          let elementType = 'unknown';
                          
                          if (t.isTSTypeReference(unionType.elementType)) {
                            elementType = unionType.elementType.typeName.name;
                          } else {
                            elementType = unionType.elementType.type
                              .replace('TS', '')
                              .replace('Keyword', '')
                              .toLowerCase();
                          }
                          
                          return `${elementType}[]`;
                        } else if (t.isTSTypeReference(unionType)) {
                          return unionType.typeName.name;
                        } else {
                          return unionType.type
                            .replace('TS', '')
                            .replace('Keyword', '')
                            .toLowerCase();
                        }
                      })
                    };
                  }
                }
              } catch (e) {
                console.warn('Error parsing type for member:', member.key?.name, e);
              }

              // Add the prop to the component info
              addProp({
                name: member.key?.name,
                type,
                typeDetails,
                optional: member.optional || false,
                source: 'interface'
              });
            });
          }
        }
      }
    });
    
    // Now handle destructured props in the component as a fallback
    traverse(ast, {
      // Handle arrow function with destructured parameters
      VariableDeclarator(path) {
        if (t.isIdentifier(path.node.id) && 
            (path.node.id.name === componentInfo.name || 
            (componentInfo.name === null && path.node.id.name.match(/[A-Z][a-zA-Z]*/)))) {
          // Might be the component
          if (t.isArrowFunctionExpression(path.node.init)) {
            // If we find a component with capital name
            if (componentInfo.name === null) {
              componentInfo.name = path.node.id.name;
            }
            
            // Check destructured props in the arrow function parameters
            path.node.init.params.forEach(param => {
              if (t.isObjectPattern(param)) {
                param.properties.forEach(prop => {
                  if (t.isObjectProperty(prop) || t.isProperty(prop)) {
                    // Only add if not already added from interface/type
                    addProp({
                      name: prop.key.name,
                      type: 'destructured',
                      typeDetails: null,
                      optional: true,
                      source: 'arrow-function-param'
                    });
                  }
                });
              }
            });
          }
        }
      },
      
      FunctionDeclaration(path) {
        if (componentInfo.name === path.node.id?.name) {
          path.node.params.forEach(param => {
            if (t.isIdentifier(param)) {
              addProp({
                name: param.name,
                type: param.typeAnnotation ? 'typed' : 'untyped',
                typeDetails: null,
                optional: false,
                source: 'function-param'
              });
            } else if (t.isObjectPattern(param)) {
              param.properties.forEach(prop => {
                if (t.isObjectProperty(prop) || t.isProperty(prop)) {
                  addProp({
                    name: prop.key.name,
                    type: 'destructured',
                    typeDetails: null,
                    optional: true,
                    source: 'function-param'
                  });
                }
              });
            }
          });
        }
      },
      
      ClassProperty(path) {
        if (path.node.key?.name === 'propTypes' && path.node.value?.properties) {
          path.node.value.properties.forEach(prop => {
            if (prop.key) {
              addProp({
                name: prop.key.name,
                type: 'prop-type',
                typeDetails: null,
                validator: prop.value?.property?.name || 'unknown',
                optional: true,
                source: 'prop-types'
              });
            }
          });
        }
      }
    });

    // Extract JSX elements used
    traverse(ast, {
      JSXElement(path) {
        const elementName = path.node.openingElement.name?.name;
        if (elementName && !componentInfo.jsxElements.includes(elementName)) {
          componentInfo.jsxElements.push(elementName);
        }
      }
    });

    // Extract component methods (for class components)
    traverse(ast, {
      ClassMethod(path) {
        if (path.node.kind === 'method' && path.node.key) {
          componentInfo.methods.push({
            name: path.node.key.name,
            params: path.node.params.map(param => param.name || 'anonymous')
          });
        }
      }
    });

    // Arrow function components
    traverse(ast, {
      ArrowFunctionExpression(path) {
        // Skip if we've already found the component
        if (componentInfo.props.length > 0) return;
        
        // Check if it's a component (returns JSX)
        const isComponent = path.get('body').isJSXElement() || 
                            (t.isBlockStatement(path.node.body) && 
                             path.node.body.body.some(node => 
                               t.isReturnStatement(node) && 
                               node.argument && 
                               t.isJSXElement(node.argument)));
        
        if (isComponent) {
          // For destructured props in arrow functions
          path.node.params.forEach(param => {
            if (t.isObjectPattern(param)) {
              param.properties.forEach(prop => {
                if (t.isObjectProperty(prop) || t.isProperty(prop)) {
                  addProp({
                    name: prop.key.name,
                    type: 'destructured',
                    typeDetails: null,
                    optional: true,
                    source: 'arrow-function'
                  });
                }
              });
            }
          });
        }
      }
    });

    return componentInfo;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Export the function for use in other files
module.exports = parseReactComponent;

// This code can be left here or moved to a test file
// Example usage
try {
  const result = parseReactComponent(formTemplateString);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error.message);
}