export function MarkdownTable({ children, ...props }: React.ComponentProps<"table">) {
    return (
        <div className="block max-w-full md:max-w-4xl w-fit overflow-x-auto my-8 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm md:-mx-12">
            <div className="inline-block min-w-full py-1 px-6 align-middle">
                <table className="min-w-full text-left border-collapse" {...props}>
                    {children}
                </table>
            </div>
        </div>
    );
}
