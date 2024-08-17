'use client';

import { FormEvent, useRef, useState } from 'react';
import { createTodo } from '@/app/actions/todo-actions';
import { useToast } from '@/components/ui/use-toast';
import { ImageIcon, Palette, SquareCheckBig } from 'lucide-react';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { handleKeyDown, autoResizeTextarea } from '@/common/utility';
import { useColorPalette } from '@/hooks/useColorPalette';
import { ColorPalette } from '@/components/color-palette';

export default function CreateNotes({ userId }: { userId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const expandRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const {
    isOpened,
    setIsOpened,
    bgColors,
    bgColor,
    setBgColor,
    colorPaletteRef,
  } = useColorPalette();

  async function action(formData: FormData) {
    const res = await createTodo(formData, userId, bgColor);
    formRef.current?.reset();
    toast({
      title: res.error ? 'Uh oh! Something went wrong.' : 'success',
      description: res.message,
      variant: res.error ? 'destructive' : 'default',
    });
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Convert checkbox value to boolean
    const done = formData.get('done') === 'on';
    formData.set('done', done.toString());

    action(formData);
  };

  useOutsideClick(expandRef, () => {
    if (isExpanded) {
      const formData = new FormData(formRef.current!);
      if (formData.get('title') && formData.get('description')) {
        // will keep this condition check until we have both these fields required, will change the schema later, to have these optional and make either of these mandatory
        action(formData);
      }
    }
    setIsExpanded(false);
    setIsOpened(false);
    setBgColor('');
  });

  useOutsideClick(colorPaletteRef, () => setIsOpened(false));

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="w-full flex justify-center">
        <div
          className={`w-screen md:w-3/5 lg:w-2/5 shadow dark:border border-slate-500 rounded-lg ${
            isExpanded
              ? `h-auto p-4 ${bgColor ? `${bgColor} border-none` : ''}`
              : 'h-11'
          }`}
          onClick={() => setIsExpanded(true)}
          ref={expandRef}
        >
          {!isExpanded && (
            <div className="flex justify-between items-center h-full px-4 text-neutral-400">
              <div>Take a note...</div>
              <div className="flex items-center gap-4">
                <SquareCheckBig />
                <ImageIcon />
              </div>
            </div>
          )}
          {isExpanded && (
            <>
              <input
                type="text"
                name="title"
                id="title"
                placeholder="Title"
                required
                className={`w-full p-2 dark:border-b border-slate-700 mb-2 outline-none ${
                  bgColor ? bgColor : ''
                }`}
              />
              <textarea
                name="description"
                placeholder="Take a note..."
                id="description"
                rows={1}
                required
                autoFocus
                className={`w-full p-2 dark:border-b border-slate-700 mb-2 outline-none resize-none ${
                  bgColor ? bgColor : ''
                }`}
                onKeyDown={handleKeyDown}
                onInput={e =>
                  autoResizeTextarea(e.currentTarget as HTMLTextAreaElement)
                }
              />
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="done"
                  id="done"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="done"
                  className="ml-2 block text-sm font-medium text-neutral-400"
                >
                  Done
                </label>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-4 text-neutral-400">
                  <SquareCheckBig className="cursor-pointer" />
                  <ImageIcon className="cursor-pointer" />
                  <Palette
                    className="cursor-pointer"
                    onClick={() => setIsOpened(true)}
                  />
                </div>
              </div>
            </>
          )}
          {isOpened && (
            <ColorPalette
              colorPaletteRef={colorPaletteRef}
              bgColors={bgColors}
              setBgColor={setBgColor}
            />
          )}
        </div>
      </div>
    </form>
  );
}
